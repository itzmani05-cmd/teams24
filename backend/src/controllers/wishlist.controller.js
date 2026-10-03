const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const getOrCreateWishlist = (userId) =>
  prisma.wishlist.upsert({ where: { userId }, update: {}, create: { userId } });

const getWishlist = async (req, res) => {
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: req.user.id },
    update: {},
    create: { userId: req.user.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discountPrice: true,
              stock: true,
              thumbnailUrl: true,
              isActive: true,
            },
          },
        },
      },
    },
  });
  res.json({ success: true, data: wishlist });
};

const addItem = async (req, res) => {
  const { productId } = req.body;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw AppError.notFound("Product not found");

  const wishlist = await getOrCreateWishlist(req.user.id);
  const item = await prisma.wishlistItem.upsert({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    update: {},
    create: { wishlistId: wishlist.id, productId },
  });
  res.status(201).json({ success: true, data: item });
};

const removeItem = async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user.id);
  const { count } = await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId: req.params.productId },
  });
  if (!count) throw AppError.notFound("Item is not in your wishlist");
  res.json({ success: true, message: "Removed from wishlist" });
};

const moveToCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw AppError.notFound("Product not found");
  if (product.stock < 1) throw AppError.badRequest("Product is out of stock");

  const wishlist = await getOrCreateWishlist(userId);
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
    if (!count) throw AppError.notFound("Item is not in your wishlist");

    const cart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: {},
      create: { cartId: cart.id, productId, quantity: 1 },
    });
  });

  res.json({ success: true, message: "Moved to cart" });
};

module.exports = { getWishlist, addItem, removeItem, moveToCart };
