/**
 * User Database Model
 * Mongoose schema for user authentication and verification
 */

const mongoose = require("mongoose"); // MongoDB object modeling library

/**
 * User Schema Definition
 * Defines the structure and validation rules for user documents
 */
const userSchema = mongoose.Schema(
  {
    // User's email address (primary identifier)
    email: {
      type: String,
      required: [true, "Email is required"], // Email is mandatory
      trim: true, // Remove whitespace
      unique: [true, "Email must be unique!"], // Ensure uniqueness
      miniLength: [5, "Email must have 5 characters!"], // Minimum length validation
      lowercase: true, // Convert to lowercase
    },
    // User's hashed password
    password: {
      type: String,
      required: [true, "Password is required"], // Password is mandatory
      minLength: [8, "Password must have 8 characters!"], // Minimum length validation
      trim: true, // Remove whitespace
      select: false, // Exclude from queries by default for security
    },
    // Email verification status
    verified: {
      type: Boolean,
      default: false, // Users start as unverified
    },
    // Hashed email verification code
    verificationCode: {
      type: String,
      select: false, // Exclude from queries by default for security
    },
    // Timestamp when verification code was generated
    verificationCodeValidation: {
      type: Number,
      select: false, // Exclude from queries by default for security
    },
    // Hashed forgot password code
    forgotPasswordCode: {
      type: String,
      select: false, // Exclude from queries by default for security
    },
    // Timestamp when forgot password code was generated
    forgotPasswordCodeValidation: {
      type: Number,
      select: false, // Exclude from queries by default for security
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the User model for use in controllers
module.exports = mongoose.model("User", userSchema);

/**
 * Sample API Request/Response Examples (for development reference)
 * 
 * User Registration Example:
 * {
 *     "email":"user@example.com",
 *     "password":"SecurePass123!"
 * }
 * 
 * User Login Example:
 * {
 *     "email":"user@example.com",
 *     "password":"SecurePass123!"
 * }
 * 
 * Login Response Example:
 * {
 *     "success":true,
 *     "message":"You have been logged in successfully",
 *     "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Change Password Example:
 * {
 *     "oldPassword":"SecurePass123!",
 *     "newPassword":"NewSecurePass456!"
 * }
 */