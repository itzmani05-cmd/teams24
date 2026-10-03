const { Router } = require("express");
const auth = require("../controllers/auth.controller");
const v = require("../validations/auth.validation");
const validate = require("../middleware/validate");
const { authenticate, requirePermission } = require("../middleware/auth");
const { PERMISSIONS } = require("../config/roles");

const router = Router();

router.post("/register", validate({ body: v.register }), auth.register);
router.post("/login", validate({ body: v.login }), auth.login);

router.get("/me", authenticate, auth.me);
router.patch(
  "/me",
  authenticate,
  requirePermission(PERMISSIONS.PROFILE_MANAGE),
  validate({ body: v.updateProfile }),
  auth.updateProfile
);
router.patch(
  "/me/password",
  authenticate,
  requirePermission(PERMISSIONS.PROFILE_MANAGE),
  validate({ body: v.changePassword }),
  auth.changePassword
);

module.exports = router;
