const { z, optionalUrl } = require("./common");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const register = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(255),
  password,
  phone: z.string().trim().max(20).optional(),
});

const login = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

const updateProfile = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(20).nullable(),
    avatarUrl: optionalUrl,
  })
  .partial();

const changePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});

module.exports = { register, login, updateProfile, changePassword };
