/**
 * Main server entry point for Auth-Project
 * A Node.js authentication API with email verification and post management
 */

// Import required dependencies
const express = require("express");
const helmet = require("helmet"); // Security middleware for setting HTTP headers
const cors = require("cors"); // Cross-Origin Resource Sharing middleware
const app = express();
const cookieParser = require("cookie-parser"); // Parse cookies from requests
const mongoose = require("mongoose"); // MongoDB object modeling tool

// Import route handlers
const authRouter = require("./routers/authRouter"); // Authentication routes
const postsRouter = require("./routers/postsRouter"); // Post management routes

// Apply middleware in order
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Set security-related HTTP headers
app.use(cookieParser()); // Parse cookies from incoming requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Connect to MongoDB database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// Register API routes
app.use("/api/auth", authRouter); // Authentication endpoints
app.use("/api/posts", postsRouter); // Post management endpoints

// Basic health check endpoint
app.get("/", (req, res) => {
  // TODO: Add proper health check response
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log("Server is running on port http://localhost:8000");
});
