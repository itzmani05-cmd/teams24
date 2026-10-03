const { z, money, optionalText, optionalUrl, paginationQuery } = require("./common");

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may contain lowercase letters, numbers and hyphens");

const booleanQuery = z
  .enum(["true", "false"])
  .transform((v) => v === "true")
  .optional();

const categoryFields = {
  name: z.string().trim().min(2).max(100),
  slug: slug.max(120).optional(),
  description: optionalText,
  imageUrl: optionalUrl,
  isActive: z.boolean().optional(),
};

const createCategory = z.object(categoryFields);
const updateCategory = z.object(categoryFields).partial();

const categoryQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().optional(),
  isActive: booleanQuery,
});

const productFields = {
  categoryId: z.uuid(),
  name: z.string().trim().min(2).max(255),
  slug: slug.max(280).optional(),
  description: optionalText,
  price: money.positive(),
  discountPrice: money.optional().nullable(),
  stock: z.coerce.number().int().nonnegative().default(0),
  brand: z.string().trim().max(100).optional().nullable(),
  sku: z.string().trim().min(1).max(100),
  thumbnailUrl: optionalUrl,
  isActive: z.boolean().optional(),
  images: z.array(z.url()).max(10).optional(),
};

const discountBelowPrice = (data) =>
  data.discountPrice == null || data.price == null || data.discountPrice < data.price;
const discountMessage = { message: "discountPrice must be lower than price", path: ["discountPrice"] };

const createProduct = z.object(productFields).refine(discountBelowPrice, discountMessage);

const updateProduct = z
  .object(productFields)
  .omit({ images: true })
  .partial()
  .extend({ stock: z.coerce.number().int().nonnegative().optional() })
  .refine(discountBelowPrice, discountMessage);

const productQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: booleanQuery,
  isActive: booleanQuery,
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc", "name_asc", "name_desc"]).default("newest"),
});

const addImages = z.object({
  images: z
    .array(z.object({ imageUrl: z.url(), sortOrder: z.coerce.number().int().nonnegative().optional() }))
    .min(1)
    .max(10),
});

const imageParams = z.object({ id: z.uuid(), imageId: z.uuid() });
const slugParam = z.object({ slug: z.string().trim().min(1) });

module.exports = {
  createCategory,
  updateCategory,
  categoryQuery,
  createProduct,
  updateProduct,
  productQuery,
  addImages,
  imageParams,
  slugParam,
};
