const express = require("express");
const authController = require("../controllers/authController");
const { idenifier } = require("../middlewares/identification");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", idenifier, authController.signout);
router.patch(
  "/send-verification-code",
  idenifier,
  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code",
  idenifier,
  authController.verfiyVerificationCode
);
router.patch("/change-password", idenifier, authController.changePassword);
router.patch(
  "/send-forgot-password-code",
  authController.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code",
  authController.verfiyForgotPasswordCode
);

module.exports = router;
