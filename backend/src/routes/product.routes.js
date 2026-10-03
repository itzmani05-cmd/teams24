const { Router } = require("express");
const product = require("../controllers/product.controller");
const review = require("../controllers/review.controller");
const v = require("../validations/catalog.validation");
const rv = require("../validations/review.validation");
const validate = require("../middleware/validate");

const router = Router();

router.get("/", validate({ query: v.productQuery }), product.listPublic);
router.get(
  "/:productId/reviews",
  validate({ params: rv.productIdParam, query: rv.productReviewsQuery }),
  review.listForProduct
);
router.get("/:slug", validate({ params: v.slugParam }), product.getBySlug);

module.exports = router;
