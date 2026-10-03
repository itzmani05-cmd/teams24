const { z } = require("zod");

const id = z.uuid("Invalid id");
const idParam = z.object({ id });
const money = z.coerce.number().nonnegative().multipleOf(0.01);
const optionalText = z.string().trim().max(5000).optional().nullable();
const optionalUrl = z.url().optional().nullable();

const paginationQuery = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
};

module.exports = { z, id, idParam, money, optionalText, optionalUrl, paginationQuery };
