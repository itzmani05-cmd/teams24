const { Router } = require("express");
const order = require("../controllers/order.controller");
const v = require("../validations/order.validation");
const { idParam } = require("../validations/common");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.use(authenticate);

router.post("/", requirePermission(PERMISSIONS.ORDER_CREATE), validate({ body: v.checkout }), order.checkout);
router.get("/", requirePermission(PERMISSIONS.ORDER_READ_OWN), validate({ query: v.myOrdersQuery }), order.listMine);
router.get("/:id", requirePermission(PERMISSIONS.ORDER_READ_OWN), validate({ params: idParam }), order.getMine);
router.post(
  "/:id/cancel",
  requirePermission(PERMISSIONS.ORDER_CANCEL_OWN),
  validate({ params: idParam }),
  order.cancelMine
);

module.exports = router;
