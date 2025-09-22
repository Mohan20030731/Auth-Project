/**
 * Posts Routes
 * Defines all post management API endpoints
 */

// Import required dependencies
const express = require("express"); // Express router
const postsController = require("../controllers/postsController"); // Posts controller functions
const { idenifier } = require("../middlewares/identification"); // JWT authentication middleware
const router = express.Router(); // Create router instance

// Public routes (no authentication required)
router.get("/all-posts", postsController.getposts); // Get paginated list of all posts
router.get("/single-post", postsController.singlepost); // Get single post by ID

// Protected routes (authentication required)
router.post("/create-post", idenifier, postsController.createPost); // Create new post
router.put("/update-post", idenifier, postsController.updatePost); // Update existing post (owner only)
router.delete("/delete-post", idenifier, postsController.deletePost); // Delete post (owner only)

// Export router for use in main application
module.exports = router;
