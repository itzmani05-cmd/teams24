const { Router } = require("express");
const wishlist = require("../controllers/wishlist.controller");
const v = require("../validations/shopping.validation");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.use(authenticate, requirePermission(PERMISSIONS.WISHLIST_MANAGE));

router.get("/", wishlist.getWishlist);
router.post("/items", validate({ body: v.addWishlistItem }), wishlist.addItem);
router.delete("/items/:productId", validate({ params: v.productParam }), wishlist.removeItem);
router.post("/items/:productId/move-to-cart", validate({ params: v.productParam }), wishlist.moveToCart);

module.exports = router;
