const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");
const { nodeEnv } = require("../config/env");

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

const fromPrismaError = (err) => {
  switch (err.code) {
    case "P2002":
      return AppError.conflict(`A record with this ${err.meta?.target ?? "value"} already exists`);
    case "P2003":
      return AppError.conflict("Operation violates a related record constraint");
    case "P2025":
      return AppError.notFound();
    default:
      return null;
  }
};

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (err instanceof Prisma.PrismaClientKnownRequestError) error = fromPrismaError(err) || err;
  if (err.type === "entity.parse.failed") error = AppError.badRequest("Malformed JSON body");

  const statusCode = error instanceof AppError ? error.statusCode : 500;
  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : error.message,
    ...(error.details && { errors: error.details }),
    ...(statusCode === 500 && nodeEnv !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
