const { Router } = require("express");
const category = require("../controllers/category.controller");
const v = require("../validations/catalog.validation");
const validate = require("../middleware/validate");

const router = Router();

router.get("/", validate({ query: v.categoryQuery }), category.listPublic);
router.get("/:slug", validate({ params: v.slugParam }), category.getBySlug);

module.exports = router;
