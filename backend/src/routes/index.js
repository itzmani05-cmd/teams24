const { Router } = require("express");

const router = Router();

router.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

router.use("/auth", require("./auth.routes"));
router.use("/addresses", require("./address.routes"));
router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
router.use("/cart", require("./cart.routes"));
router.use("/wishlist", require("./wishlist.routes"));
router.use("/orders", require("./order.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;
