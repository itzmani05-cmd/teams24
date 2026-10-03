const { Router } = require("express");
const review = require("../controllers/review.controller");
const v = require("../validations/review.validation");
const { idParam } = require("../validations/common");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.use(authenticate);

router.get(
  "/me",
  requirePermission(PERMISSIONS.REVIEW_MANAGE_OWN),
  validate({ query: v.productReviewsQuery }),
  review.listMine
);
router.post("/", requirePermission(PERMISSIONS.REVIEW_CREATE), validate({ body: v.create }), review.create);
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.REVIEW_MANAGE_OWN),
  validate({ params: idParam, body: v.update }),
  review.update
);
router.delete("/:id", requirePermission(PERMISSIONS.REVIEW_MANAGE_OWN), validate({ params: idParam }), review.remove);

module.exports = router;
