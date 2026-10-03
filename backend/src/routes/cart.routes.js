const { Router } = require("express");
const cart = require("../controllers/cart.controller");
const v = require("../validations/shopping.validation");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.use(authenticate, requirePermission(PERMISSIONS.CART_MANAGE));

router.get("/", cart.getCart);
router.delete("/", cart.clear);
router.post("/items", validate({ body: v.addCartItem }), cart.addItem);
router.patch("/items/:productId", validate({ params: v.productParam, body: v.updateCartItem }), cart.updateItem);
router.delete("/items/:productId", validate({ params: v.productParam }), cart.removeItem);

module.exports = router;
