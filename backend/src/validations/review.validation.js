const { z, paginationQuery } = require("./common");

const rating = z.coerce.number().int().min(1).max(5);
const comment = z.string().trim().max(2000).optional().nullable();

const create = z.object({ productId: z.uuid(), rating, comment });
const update = z.object({ rating, comment }).partial();

const productReviewsQuery = z.object({
  ...paginationQuery,
  sort: z.enum(["newest", "highest", "lowest"]).default("newest"),
});

const adminReviewsQuery = z.object({
  ...paginationQuery,
  productId: z.uuid().optional(),
  userId: z.uuid().optional(),
  rating: rating.optional(),
  isVerified: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const productIdParam = z.object({ productId: z.uuid() });
const setVerified = z.object({ isVerified: z.boolean() });

module.exports = { create, update, productReviewsQuery, adminReviewsQuery, productIdParam, setVerified };
