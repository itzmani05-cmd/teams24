const { Router } = require("express");
const admin = require("../controllers/admin.controller");
const category = require("../controllers/category.controller");
const product = require("../controllers/product.controller");
const order = require("../controllers/order.controller");
const review = require("../controllers/review.controller");
const catalogV = require("../validations/catalog.validation");
const orderV = require("../validations/order.validation");
const reviewV = require("../validations/review.validation");
const userV = require("../validations/user.validation");
const { idParam } = require("../validations/common");
const validate = require("../middleware/validate");
const { authenticate, authorizeRoles, requirePermission: can } = require("../middleware/auth");
const { PERMISSIONS: P } = require("../config/roles");

const router = Router();

router.use(authenticate, authorizeRoles("admin"));

router.get("/dashboard", can(P.DASHBOARD_VIEW), validate({ query: userV.dashboardQuery }), admin.dashboard);

router.get("/users", can(P.USER_READ), validate({ query: userV.listUsersQuery }), admin.listUsers);
router.get("/users/:id", can(P.USER_READ), validate({ params: idParam }), admin.getUser);
router.patch("/users/:id", can(P.USER_MANAGE), validate({ params: idParam, body: userV.updateUser }), admin.updateUser);

router.get("/categories", can(P.CATEGORY_MANAGE), validate({ query: catalogV.categoryQuery }), category.listAdmin);
router.post("/categories", can(P.CATEGORY_MANAGE), validate({ body: catalogV.createCategory }), category.create);
router.get("/categories/:id", can(P.CATEGORY_MANAGE), validate({ params: idParam }), category.getById);
router.patch(
  "/categories/:id",
  can(P.CATEGORY_MANAGE),
  validate({ params: idParam, body: catalogV.updateCategory }),
  category.update
);
router.delete("/categories/:id", can(P.CATEGORY_MANAGE), validate({ params: idParam }), category.remove);

router.get("/products", can(P.PRODUCT_MANAGE), validate({ query: catalogV.productQuery }), product.listAdmin);
router.post("/products", can(P.PRODUCT_MANAGE), validate({ body: catalogV.createProduct }), product.create);
router.get("/products/:id", can(P.PRODUCT_MANAGE), validate({ params: idParam }), product.getById);
router.patch(
  "/products/:id",
  can(P.PRODUCT_MANAGE),
  validate({ params: idParam, body: catalogV.updateProduct }),
  product.update
);
router.delete("/products/:id", can(P.PRODUCT_MANAGE), validate({ params: idParam }), product.remove);
router.post(
  "/products/:id/images",
  can(P.PRODUCT_MANAGE),
  validate({ params: idParam, body: catalogV.addImages }),
  product.addImages
);
router.delete(
  "/products/:id/images/:imageId",
  can(P.PRODUCT_MANAGE),
  validate({ params: catalogV.imageParams }),
  product.removeImage
);

router.get("/orders", can(P.ORDER_READ_ALL), validate({ query: orderV.adminOrdersQuery }), order.listAll);
router.get("/orders/:id", can(P.ORDER_READ_ALL), validate({ params: idParam }), order.getAny);
router.patch(
  "/orders/:id/status",
  can(P.ORDER_MANAGE),
  validate({ params: idParam, body: orderV.updateStatus }),
  order.updateStatus
);
router.patch(
  "/orders/:id/payment-status",
  can(P.ORDER_MANAGE),
  validate({ params: idParam, body: orderV.updatePaymentStatus }),
  order.updatePaymentStatus
);

router.get("/reviews", can(P.REVIEW_MANAGE_ALL), validate({ query: reviewV.adminReviewsQuery }), review.listAll);
router.patch(
  "/reviews/:id/verify",
  can(P.REVIEW_MANAGE_ALL),
  validate({ params: idParam, body: reviewV.setVerified }),
  review.setVerified
);
router.delete("/reviews/:id", can(P.REVIEW_MANAGE_ALL), validate({ params: idParam }), review.remove);

module.exports = router;
