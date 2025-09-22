/**
 * Hashing Utilities
 * Provides password hashing and HMAC functions for security
 */

// Import required cryptographic functions
const { createHmac } = require("crypto"); // Node.js crypto module for HMAC
const { hash, compare } = require("bcrypt"); // bcrypt for password hashing

/**
 * Hash Password Function
 * Uses bcrypt to hash passwords with salt for secure storage
 * @param {string} value - Plain text password to hash
 * @param {number} saltValue - Number of salt rounds (higher = more secure but slower)
 * @returns {Promise<string>} - Hashed password
 */
exports.doHash = (value, saltValue) => {
  const result = hash(value, saltValue);
  return result;
};

/**
 * Validate Password Function
 * Compares plain text password with hashed password
 * @param {string} value - Plain text password to verify
 * @param {string} hashedValue - Stored hashed password
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
exports.doHashValidation = (value, hashedValue) => {
  const result = compare(value, hashedValue);
  return result;
};

/**
 * HMAC Processing Function
 * Creates HMAC hash for verification codes (email verification, password reset)
 * @param {string} value - Value to hash (verification code)
 * @param {string} key - Secret key for HMAC
 * @returns {string} - HMAC hash in hexadecimal format
 */
exports.hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
