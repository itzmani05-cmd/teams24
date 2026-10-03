const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { hasPermission, PERMISSIONS } = require("../config/roles");
const { getPagination, paginated } = require("../utils/helpers");

const SORTS = {
  newest: { createdAt: "desc" },
  highest: { rating: "desc" },
  lowest: { rating: "asc" },
};

const reviewer = { select: { id: true, name: true, avatarUrl: true } };

const listReviews = async (where, query, include) => {
  const pagination = getPagination(query);
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: SORTS[query.sort] || SORTS.newest,
      skip: pagination.skip,
      take: pagination.take,
      include,
    }),
    prisma.review.count({ where }),
  ]);
  return paginated(items, total, pagination);
};

const listForProduct = async (req, res) => {
  const { productId } = req.params;
  const [data, stats] = await Promise.all([
    listReviews({ productId }, req.query, { user: reviewer }),
    prisma.review.groupBy({ by: ["rating"], where: { productId }, _count: { rating: true } }),
  ]);

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let count = 0;
  for (const row of stats) {
    breakdown[row.rating] = row._count.rating;
    sum += row.rating * row._count.rating;
    count += row._count.rating;
  }

  res.json({
    success: true,
    data: {
      ...data,
      summary: { average: count ? Number((sum / count).toFixed(1)) : null, count, breakdown },
    },
  });
};

const create = async (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound("Product not found");

  const existing = await prisma.review.findFirst({ where: { userId, productId } });
  if (existing) throw AppError.conflict("You have already reviewed this product");

  const deliveredOrder = await prisma.order.findFirst({
    where: { userId, orderStatus: "delivered", items: { some: { productId } } },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
      orderId: deliveredOrder?.id ?? null,
      isVerified: Boolean(deliveredOrder),
    },
    include: { user: reviewer },
  });
  res.status(201).json({ success: true, data: review });
};

const findOwned = async (id, userId) => {
  const review = await prisma.review.findFirst({ where: { id, userId } });
  if (!review) throw AppError.notFound("Review not found");
  return review;
};

const listMine = async (req, res) => {
  const data = await listReviews({ userId: req.user.id }, req.query, {
    product: { select: { id: true, name: true, slug: true, thumbnailUrl: true } },
  });
  res.json({ success: true, data });
};

const update = async (req, res) => {
  await findOwned(req.params.id, req.user.id);
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: req.body,
    include: { user: reviewer },
  });
  res.json({ success: true, data: review });
};

const remove = async (req, res) => {
  const canManageAll = hasPermission(req.user.role, PERMISSIONS.REVIEW_MANAGE_ALL);
  const where = canManageAll ? { id: req.params.id } : { id: req.params.id, userId: req.user.id };

  const { count } = await prisma.review.deleteMany({ where });
  if (!count) throw AppError.notFound("Review not found");
  res.json({ success: true, message: "Review deleted" });
};

const listAll = async (req, res) => {
  const { productId, userId, rating, isVerified } = req.query;
  const where = {
    ...(productId && { productId }),
    ...(userId && { userId }),
    ...(rating && { rating }),
    ...(isVerified !== undefined && { isVerified }),
  };
  const data = await listReviews(where, req.query, {
    user: { select: { id: true, name: true, email: true } },
    product: { select: { id: true, name: true, slug: true } },
  });
  res.json({ success: true, data });
};

const setVerified = async (req, res) => {
  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: { isVerified: req.body.isVerified },
  });
  res.json({ success: true, data: review });
};

module.exports = { listForProduct, create, listMine, update, remove, listAll, setVerified };
