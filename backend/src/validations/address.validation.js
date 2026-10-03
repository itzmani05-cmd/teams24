const { z } = require("./common");

const fields = {
  fullName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(5).max(20),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(100),
  isDefault: z.boolean().optional(),
};

const create = z.object(fields);
const update = z.object(fields).partial();

module.exports = { create, update };
