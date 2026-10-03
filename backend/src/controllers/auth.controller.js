const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { jwtSecret, jwtExpiresIn } = require("../config/env");
const { ROLE_PERMISSIONS } = require("../config/roles");
const AppError = require("../utils/AppError");

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

const withPermissions = (user) => ({ ...user, permissions: ROLE_PERMISSIONS[user.role] });

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw AppError.conflict("Email is already registered");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      cart: { create: {} },
      wishlist: { create: {} },
    },
    select: publicUser,
  });

  res.status(201).json({ success: true, data: { user: withPermissions(user), token: signToken(user) } });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw AppError.unauthorized("Invalid email or password");
  if (!user.isActive) throw AppError.forbidden("Account is deactivated");

  const { passwordHash, updatedAt, ...safeUser } = user;
  res.json({ success: true, data: { user: withPermissions(safeUser), token: signToken(user) } });
};

const me = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: publicUser });
  res.json({ success: true, data: withPermissions(user) });
};

const updateProfile = async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
    select: publicUser,
  });
  res.json({ success: true, data: user });
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw AppError.badRequest("Current password is incorrect");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  res.json({ success: true, message: "Password updated" });
};

module.exports = { register, login, me, updateProfile, changePassword, publicUser };
