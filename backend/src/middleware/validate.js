const { z } = require("zod");
const AppError = require("../utils/AppError");

const validate = (schemas) => (req, res, next) => {
  for (const key of ["params", "query", "body"]) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key] ?? {});
    if (!result.success) {
      throw AppError.badRequest("Validation failed", z.flattenError(result.error).fieldErrors);
    }
    if (key === "query") {
      Object.defineProperty(req, "query", { value: result.data, writable: true });
    } else {
      req[key] = result.data;
    }
  }
  next();
};

module.exports = validate;
