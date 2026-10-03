const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { slugify, getPagination, paginated } = require("../utils/helpers");

const buildWhere = ({ search, isActive }) => ({
  ...(isActive !== undefined && { isActive }),
  ...(search && { name: { contains: search, mode: "insensitive" } }),
});

const listCategories = async (query, extraWhere = {}) => {
  const pagination = getPagination(query);
  const where = { ...buildWhere(query), ...extraWhere };
  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { _count: { select: { products: true } } },
    }),
    prisma.category.count({ where }),
  ]);
  return paginated(items, total, pagination);
};

const listPublic = async (req, res) => {
  res.json({ success: true, data: await listCategories(req.query, { isActive: true }) });
};

const getBySlug = async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, isActive: true },
  });
  if (!category) throw AppError.notFound("Category not found");
  res.json({ success: true, data: category });
};

const listAdmin = async (req, res) => {
  res.json({ success: true, data: await listCategories(req.query) });
};

const getById = async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw AppError.notFound("Category not found");
  res.json({ success: true, data: category });
};

const create = async (req, res) => {
  const data = { ...req.body, slug: req.body.slug || slugify(req.body.name) };
  const category = await prisma.category.create({ data });
  res.status(201).json({ success: true, data: category });
};

const update = async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: category });
};

const remove = async (req, res) => {
  const productCount = await prisma.product.count({ where: { categoryId: req.params.id } });
  if (productCount) {
    throw AppError.conflict(`Category has ${productCount} product(s); move or delete them first`);
  }
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Category deleted" });
};

module.exports = { listPublic, getBySlug, listAdmin, getById, create, update, remove };
