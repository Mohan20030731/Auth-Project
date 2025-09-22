/**
 * Email Service Configuration
 * Configures Nodemailer transport for sending verification and password reset emails
 */

const nodemailer = require("nodemailer"); // Email sending library

/**
 * Gmail SMTP Transport Configuration
 * Uses Gmail service with app-specific password for authentication
 */
const transport = nodemailer.createTransport({
  service: "gmail", // Use Gmail SMTP service
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS, // Sender email address
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD, // App-specific password (not regular password)
  },
});

// Export configured transport for use in controllers
module.exports = transport;
