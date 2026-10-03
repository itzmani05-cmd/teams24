const { Router } = require("express");
const address = require("../controllers/address.controller");
const v = require("../validations/address.validation");
const { idParam } = require("../validations/common");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.use(authenticate, requirePermission(PERMISSIONS.ADDRESS_MANAGE));

router.get("/", address.list);
router.post("/", validate({ body: v.create }), address.create);
router.get("/:id", validate({ params: idParam }), address.getOne);
router.patch("/:id", validate({ params: idParam, body: v.update }), address.update);
router.delete("/:id", validate({ params: idParam }), address.remove);

module.exports = router;
