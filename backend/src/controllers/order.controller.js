const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { shipping } = require("../config/env");
const { getPagination, paginated, generateOrderNumber } = require("../utils/helpers");

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const RESTOCK_STATUSES = ["cancelled", "returned"];
const CUSTOMER_CANCELLABLE = ["pending", "confirmed"];

const orderDetailInclude = {
  address: true,
  items: {
    include: { product: { select: { id: true, slug: true, thumbnailUrl: true } } },
  },
};

const restock = (tx, items) =>
  Promise.all(
    items.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    )
  );

const checkout = async (req, res) => {
  const userId = req.user.id;
  const { addressId, paymentMethod } = req.body;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw AppError.badRequest("Address not found");

  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) throw AppError.badRequest("Your cart is empty");

    let subtotal = new Prisma.Decimal(0);
    let discountAmount = new Prisma.Decimal(0);
    const orderItems = [];

    for (const { product, quantity } of cart.items) {
      if (!product.isActive) throw AppError.badRequest(`"${product.name}" is no longer available`);

      const { count } = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (!count) throw AppError.badRequest(`Not enough stock for "${product.name}"`);

      const unitPrice = product.discountPrice ?? product.price;
      subtotal = subtotal.plus(product.price.times(quantity));
      discountAmount = discountAmount.plus(product.price.minus(unitPrice).times(quantity));
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: unitPrice,
        quantity,
        subtotal: unitPrice.times(quantity),
      });
    }

    const afterDiscount = subtotal.minus(discountAmount);
    const shippingAmount = new Prisma.Decimal(
      afterDiscount.greaterThanOrEqualTo(shipping.freeAbove) ? 0 : shipping.flatRate
    );

    const created = await tx.order.create({
      data: {
        userId,
        addressId,
        orderNumber: generateOrderNumber(),
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount: afterDiscount.plus(shippingAmount),
        paymentMethod,
        items: { create: orderItems },
      },
      include: orderDetailInclude,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  res.status(201).json({ success: true, data: order });
};

const buildAdminWhere = ({ status, paymentStatus, userId, search, from, to }) => ({
  ...(status && { orderStatus: status }),
  ...(paymentStatus && { paymentStatus }),
  ...(userId && { userId }),
  ...((from || to) && {
    createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) },
  }),
  ...(search && {
    OR: [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ],
  }),
});

const listOrders = async (where, query, include) => {
  const pagination = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include,
    }),
    prisma.order.count({ where }),
  ]);
  return paginated(items, total, pagination);
};

const listMine = async (req, res) => {
  const where = { userId: req.user.id, ...(req.query.status && { orderStatus: req.query.status }) };
  const data = await listOrders(where, req.query, { _count: { select: { items: true } } });
  res.json({ success: true, data });
};

const getMine = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: orderDetailInclude,
  });
  if (!order) throw AppError.notFound("Order not found");
  res.json({ success: true, data: order });
};

const cancelMine = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { items: true },
  });
  if (!order) throw AppError.notFound("Order not found");
  if (!CUSTOMER_CANCELLABLE.includes(order.orderStatus)) {
    throw AppError.badRequest(`Orders that are ${order.orderStatus} can no longer be cancelled`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, orderStatus: { in: CUSTOMER_CANCELLABLE } },
      data: { orderStatus: "cancelled" },
    });
    if (!count) throw AppError.conflict("Order status changed; please refresh");
    await restock(tx, order.items);
    return tx.order.findUnique({ where: { id: order.id }, include: orderDetailInclude });
  });

  res.json({ success: true, data: updated });
};

const listAll = async (req, res) => {
  const data = await listOrders(buildAdminWhere(req.query), req.query, {
    user: { select: { id: true, name: true, email: true } },
    _count: { select: { items: true } },
  });
  res.json({ success: true, data });
};

const getAny = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      ...orderDetailInclude,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) throw AppError.notFound("Order not found");
  res.json({ success: true, data: order });
};

const updateStatus = async (req, res) => {
  const next = req.body.orderStatus;
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) throw AppError.notFound("Order not found");

  if (!STATUS_TRANSITIONS[order.orderStatus].includes(next)) {
    throw AppError.badRequest(`Cannot change order status from ${order.orderStatus} to ${next}`, {
      allowed: STATUS_TRANSITIONS[order.orderStatus],
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, orderStatus: order.orderStatus },
      data: {
        orderStatus: next,
        ...(next === "delivered" && order.paymentMethod === "cod" && { paymentStatus: "paid" }),
      },
    });
    if (!count) throw AppError.conflict("Order status changed; please refresh");
    if (RESTOCK_STATUSES.includes(next)) await restock(tx, order.items);
    return tx.order.findUnique({ where: { id: order.id }, include: orderDetailInclude });
  });

  res.json({ success: true, data: updated });
};

const updatePaymentStatus = async (req, res) => {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { paymentStatus: req.body.paymentStatus },
  });
  res.json({ success: true, data: order });
};

module.exports = {
  STATUS_TRANSITIONS,
  checkout,
  listMine,
  getMine,
  cancelMine,
  listAll,
  getAny,
  updateStatus,
  updatePaymentStatus,
};
