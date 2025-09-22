/**
 * Input Validation Schemas
 * Joi validation schemas for user authentication and post management
 */

const Joi = require("joi"); // Input validation library

/**
 * User Signup Validation Schema
 * Validates email format and password strength requirements
 */
exports.signupSchema = Joi.object({
  email: Joi.string()
    .min(6) // Minimum 6 characters
    .max(60) // Maximum 60 characters
    .required() // Email is required
    .email({
      tlds: { allow: ["com", "net", "org", "io"] }, // Allowed top-level domains
    }),
  password: Joi.string()
    .required() // Password is required
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Must contain lowercase, uppercase, digit, min 8 chars
});

/**
 * User Signin Validation Schema
 * Same validation rules as signup for consistency
 */
exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(6) // Minimum 6 characters
    .max(60) // Maximum 60 characters
    .required() // Email is required
    .email({
      tlds: { allow: ["com", "net", "org", "io"] }, // Allowed top-level domains
    }),
  password: Joi.string()
    .required() // Password is required
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Password strength requirements
});

/**
 * Email Verification Code Validation Schema
 * Validates email and 6-digit verification code
 */
exports.acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(6) // Minimum 6 characters
    .max(60) // Maximum 60 characters
    .required() // Email is required
    .email({
      tlds: { allow: ["com", "net", "org", "io"] }, // Allowed top-level domains
    }),
  providedCode: Joi.number().required(), // 6-digit verification code
});

/**
 * Change Password Validation Schema
 * Validates both old and new passwords meet strength requirements
 */
exports.changePasswordSchema = Joi.object({
  newPassword: Joi.string()
    .required() // New password is required
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Password strength requirements
  oldPassword: Joi.string()
    .required() // Old password is required for verification
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")), // Password strength requirements
});

/**
 * Forgot Password Code Validation Schema
 * Validates email and password reset code
 */
exports.acceptFPCodeSchema = Joi.object({
  email: Joi.string()
    .min(6) // Minimum 6 characters
    .max(60) // Maximum 60 characters
    .required() // Email is required
    .email({
      tlds: { allow: ["com", "net", "org", "io"] }, // Allowed top-level domains
    }),
  providedCode: Joi.number().required(), // 6-digit password reset code
});

/**
 * Create/Update Post Validation Schema
 * Validates post title, description, and user ID
 */
exports.createPostSchema = Joi.object({
  title: Joi.string().min(3).max(60).required(), // Post title: 3-60 characters
  description: Joi.string().min(3).max(600).required(), // Post content: 3-600 characters
  userId: Joi.string().required(), // User ID from JWT token
});
