const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discountPrice: true,
  stock: true,
  thumbnailUrl: true,
  isActive: true,
};

const getOrCreateCart = (userId) =>
  prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });

const buildCartResponse = async (userId) => {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: { 
        orderBy: {createdAt: "asc" }, 
        include: {product:{select: productSelect}} 
      },
    },
  });

  let subtotal = 0;
  let itemCount = 0;
  const items = cart.items.map((item) => {
    const unitPrice = Number(item.product.discountPrice ?? item.product.price);
    const lineTotal = unitPrice * item.quantity;
    const available = item.product.isActive && item.product.stock >= item.quantity;
    if (available) {
      subtotal += lineTotal;
      itemCount += item.quantity;
    }
    return { ...item, unitPrice, lineTotal: Number(lineTotal.toFixed(2)), available };
  });

  return { id: cart.id, items, itemCount, subtotal: Number(subtotal.toFixed(2)) };
};

const findPurchasableProduct = async (productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) 
    throw AppError.notFound("Product not found");
  return product;
};

const getCart = async (req, res) => {
  res.json({ 
    success: true, 
    data: await buildCartResponse(req.user.id) 
  });
};

const addItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await findPurchasableProduct(productId);
  const cart = await getOrCreateCart(req.user.id);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (newQuantity > product.stock) 
    throw AppError.badRequest(`Only ${product.stock} item(s) in stock`);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: newQuantity },
    create: { cartId: cart.id, productId, quantity },
  });

  res.status(201).json({ 
    success: true, 
    data: await buildCartResponse(req.user.id) 
  });
};

const updateItem = async (req, res) => {
  const { productId } = req.params;
  const product = await findPurchasableProduct(productId);
  if (req.body.quantity > product.stock) 
    throw AppError.badRequest(`Only ${product.stock} item(s) in stock`);

  const cart = await getOrCreateCart(req.user.id);
  const { count } = await prisma.cartItem.updateMany({
    where: { cartId: cart.id, productId },
    data: { quantity: req.body.quantity },
  });

  if (!count) 
    throw AppError.notFound("Item is not in your cart");

  res.json({ 
    success: true, 
    data: await buildCartResponse(req.user.id) 
  });
};

const removeItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const { count } = await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: req.params.productId },
  });
  if (!count) 
    throw AppError.notFound("Item is not in your cart");

  res.json({ 
    success: true, 
    data: await buildCartResponse(req.user.id) 
  });
};

const clear = async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ 
    success: true, 
    data: await buildCartResponse(req.user.id) 
  });
};

module.exports = { getCart, addItem, updateItem, removeItem, clear };
