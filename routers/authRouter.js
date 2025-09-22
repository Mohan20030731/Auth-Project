/**
 * Authentication Routes
 * Defines all authentication-related API endpoints
 */

// Import required dependencies
const express = require("express"); // Express router
const authController = require("../controllers/authController"); // Authentication controller functions
const { idenifier } = require("../middlewares/identification"); // JWT authentication middleware
const router = express.Router(); // Create router instance

// Public routes (no authentication required)
router.post("/signup", authController.signup); // User registration
router.post("/signin", authController.signin); // User login

// Protected routes (authentication required)
router.post("/signout", idenifier, authController.signout); // User logout

// Email verification routes (authentication required)
router.patch(
  "/send-verification-code", // Send verification code to user's email
  idenifier, // Require authentication
  authController.sendVerificationCode
);
router.patch(
  "/verify-verification-code", // Verify email with provided code
  idenifier, // Require authentication
  authController.verfiyVerificationCode
);

// Password management routes
router.patch("/change-password", idenifier, authController.changePassword); // Change password (requires auth)

// Forgot password routes (public - no authentication required)
router.patch(
  "/send-forgot-password-code", // Send password reset code
  authController.sendForgotPasswordCode
);
router.patch(
  "/verify-forgot-password-code", // Reset password with code
  authController.verfiyForgotPasswordCode
);

// Export router for use in main application
module.exports = router;
