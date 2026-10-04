const multer = require("multer");
const AppError = require("../utils/AppError");
const { ALLOWED_IMAGE_TYPES } = require("../lib/storage");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(AppError.badRequest("Only JPG, PNG, WEBP or GIF images are allowed"));
  },
});

const singleImage = (field) => (req, res, next) =>
  imageUpload.single(field)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return next(
        AppError.badRequest(err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message)
      );
    }
    if (err) return next(err);
    if (!req.file) return next(AppError.badRequest("No image file provided (field name: image)"));
    next();
  });

module.exports = { singleImage };
