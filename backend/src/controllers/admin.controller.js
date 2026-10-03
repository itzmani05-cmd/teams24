const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { publicUser } = require("./auth.controller");
const { getPagination, paginated } = require("../utils/helpers");

const LOW_STOCK_THRESHOLD = 5;
const REVENUE_STATUSES = ["confirmed", "processing", "shipped", "delivered"];

const dashboard = async (req, res) => {
  const since = new Date(Date.now() - req.query.days * 24 * 60 * 60 * 1000);
  const revenueWhere = { orderStatus: { in: REVENUE_STATUSES }, paymentStatus: { not: "refunded" } };

  const [
    totalUsers,
    newUsers,
    totalProducts,
    activeProducts,
    totalOrders,
    ordersByStatus,
    revenueAll,
    revenuePeriod,
    lowStock,
    recentOrders,
    topSelling,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: since } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
    prisma.order.aggregate({ where: revenueWhere, _sum: { totalAmount: true } }),
    prisma.order.aggregate({
      where: { ...revenueWhere, createdAt: { gte: since } },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 10,
      select: { id: true, name: true, sku: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: { order: { ...revenueWhere, createdAt: { gte: since } } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  res.json({
    success: true,
    data: {
      periodDays: req.query.days,
      users: { total: totalUsers, newInPeriod: newUsers },
      products: { total: totalProducts, active: activeProducts, lowStock },
      orders: {
        total: totalOrders,
        inPeriod: revenuePeriod._count._all,
        byStatus: Object.fromEntries(ordersByStatus.map((r) => [r.orderStatus, r._count._all])),
        recent: recentOrders,
      },
      revenue: {
        total: revenueAll._sum.totalAmount ?? 0,
        inPeriod: revenuePeriod._sum.totalAmount ?? 0,
      },
      topSelling: topSelling.map((row) => ({
        productId: row.productId,
        productName: row.productName,
        quantitySold: row._sum.quantity,
        revenue: row._sum.subtotal,
      })),
    },
  });
};

const listUsers = async (req, res) => {
  const { search, role, isActive } = req.query;
  const pagination = getPagination(req.query);
  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: { ...publicUser, _count: { select: { orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: paginated(items, total, pagination) });
};

const getUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      ...publicUser,
      addresses: true,
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { orders: true, reviews: true } },
    },
  });
  if (!user) throw AppError.notFound("User not found");
  res.json({ success: true, data: user });
};

const updateUser = async (req, res) => {
  if (req.params.id === req.user.id) {
    throw AppError.badRequest("You cannot change your own role or status");
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
    select: publicUser,
  });
  res.json({ success: true, data: user });
};

module.exports = { dashboard, listUsers, getUser, updateUser };
