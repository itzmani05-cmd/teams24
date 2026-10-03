const { z, paginationQuery } = require("./common");

const listUsersQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().optional(),
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

const updateUser = z
  .object({
    role: z.enum(["customer", "admin"]),
    isActive: z.boolean(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "Provide role and/or isActive" });

const dashboardQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

module.exports = { listUsersQuery, updateUser, dashboardQuery };
