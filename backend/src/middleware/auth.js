const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { jwtSecret } = require("../config/env");
const { hasPermission } = require("../config/roles");
const AppError = require("../utils/AppError");

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw AppError.unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user) throw AppError.unauthorized("User no longer exists");
  if (!user.isActive) throw AppError.forbidden("Account is deactivated");

  req.user = user;
  next();
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) throw AppError.unauthorized();
  if (!roles.includes(req.user.role)) throw AppError.forbidden();
  next();
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) throw AppError.unauthorized();
  const allowed = permissions.every((p) => hasPermission(req.user.role, p));
  if (!allowed) throw AppError.forbidden();
  next();
};

module.exports = { authenticate, authorizeRoles, requirePermission };
