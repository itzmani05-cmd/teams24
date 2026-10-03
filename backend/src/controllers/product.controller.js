const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { slugify, getPagination, paginated } = require("../utils/helpers");

const SORTS = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name_asc: { name: "asc" },
  name_desc: { name: "desc" },
};

const buildWhere = (query) => {
  const { search, category, brand, minPrice, maxPrice, inStock, isActive } = query;
  return {
    ...(isActive !== undefined && { isActive }),
    ...(category && { category: { slug: category } }),
    ...(brand && { brand: { equals: brand, mode: "insensitive" } }),
    ...(inStock && { stock: { gt: 0 } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };
};

const listProducts = async (query, extraWhere = {}) => {
  const pagination = getPagination(query);
  const where = { AND: [buildWhere(query), extraWhere] };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: SORTS[query.sort],
      skip: pagination.skip,
      take: pagination.take,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);
  return paginated(items, total, pagination);
};

const withRating = async (product) => {
  const stats = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    ...product,
    rating: {
      average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
      count: stats._count.rating,
    },
  };
};

const detailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
};

const listPublic = async (req, res) => {
  const data = await listProducts(req.query, { isActive: true, category: { isActive: true } });
  res.json({ success: true, data });
};

const getBySlug = async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: detailInclude,
  });
  if (!product) throw AppError.notFound("Product not found");
  res.json({ success: true, data: await withRating(product) });
};

const listAdmin = async (req, res) => {
  res.json({ success: true, data: await listProducts(req.query) });
};

const getById = async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: detailInclude });
  if (!product) throw AppError.notFound("Product not found");
  res.json({ success: true, data: await withRating(product) });
};

const ensureCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw AppError.badRequest("Category does not exist");
};

const create = async (req, res) => {
  const { images = [], ...data } = req.body;
  await ensureCategory(data.categoryId);

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: data.slug || slugify(data.name),
      thumbnailUrl: data.thumbnailUrl ?? images[0] ?? null,
      images: { create: images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) },
    },
    include: detailInclude,
  });
  res.status(201).json({ success: true, data: product });
};

const update = async (req, res) => {
  if (req.body.categoryId) await ensureCategory(req.body.categoryId);

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Product not found");

  const price = req.body.price ?? Number(existing.price);
  const discountPrice =
    req.body.discountPrice !== undefined ? req.body.discountPrice : existing.discountPrice && Number(existing.discountPrice);
  if (discountPrice != null && discountPrice >= price) {
    throw AppError.badRequest("discountPrice must be lower than price");
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    include: detailInclude,
  });
  res.json({ success: true, data: product });
};

const remove = async (req, res) => {
  const ordered = await prisma.orderItem.count({ where: { productId: req.params.id } });
  if (ordered) {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({
      success: true,
      message: "Product has order history, so it was deactivated instead of deleted",
    });
  }
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Product deleted" });
};

const addImages = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { images: true } } },
  });
  if (!product) throw AppError.notFound("Product not found");

  const start = product._count.images;
  await prisma.productImage.createMany({
    data: req.body.images.map((img, i) => ({
      productId: product.id,
      imageUrl: img.imageUrl,
      sortOrder: img.sortOrder ?? start + i,
    })),
  });

  const images = await prisma.productImage.findMany({
    where: { productId: product.id },
    orderBy: { sortOrder: "asc" },
  });
  res.status(201).json({ success: true, data: images });
};

const removeImage = async (req, res) => {
  const { count } = await prisma.productImage.deleteMany({
    where: { id: req.params.imageId, productId: req.params.id },
  });
  if (!count) throw AppError.notFound("Image not found");
  res.json({ success: true, message: "Image deleted" });
};

module.exports = {
  listPublic,
  getBySlug,
  listAdmin,
  getById,
  create,
  update,
  remove,
  addImages,
  removeImage,
};
