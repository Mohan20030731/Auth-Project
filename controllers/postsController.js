/**
 * Posts Controller
 * Handles CRUD operations for user posts with pagination and authorization
 */

// Import required dependencies
const { date } = require("joi"); // Joi date validation (unused)
const Post = require("../models/postsModel"); // Post database model
const { createPostSchema } = require("../middlewares/validator"); // Post validation schema

/**
 * Get Posts with Pagination Handler
 * Retrieves posts with pagination, sorted by creation date (newest first)
 */
exports.getposts = async (req, res) => {
  const { page } = req.query;
  const postsPerPage = 10; // Number of posts per page
  try {
    // Calculate page number for database skip operation
    let pageNum = 0;
    if (page <= 1) {
      pageNum = 0; // First page
    } else {
      pageNum = page - 1; // Convert to zero-based index
    }
    
    // Fetch posts with pagination and user information
    const result = await Post.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(pageNum * postsPerPage) // Skip posts for pagination
      .limit(postsPerPage) // Limit results per page
      .populate({
        path: "userId", // Populate user information
        select: "email", // Only include email field
      });
      
    res.status(200).json({ success: true, message: "posts", data: result });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Create Post Handler
 * Creates a new post for authenticated users
 */
exports.createPost = async (req, res) => {
  const { title, description } = req.body;
  const { userId } = req.user; // From JWT token
  try {
    // Validate input data using Joi schema
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    // Create new post in database
    const result = await Post.create({
      title,
      description,
      userId,
    });
    
    res
      .status(201)
      .json({ success: true, message: "post created", data: result });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get Single Post Handler
 * Retrieves a specific post by ID with user information
 */
exports.singlepost = async (req, res) => {
  const { _id } = req.query;
  try {
    // Find post by ID and populate user information
    const existingPost = await Post.findOne({ _id }).populate({
      path: "userId", // Populate user information
      select: "email", // Only include email field
    });
    
    // Check if post exists
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found!" });
    }
    
    res
      .status(200)
      .json({ success: true, message: "Single post", data: existingPost }); // Fixed: use existingPost instead of result
  } catch (error) {
    console.log(error);
  }
};

/**
 * Update Post Handler
 * Updates an existing post (only by the post owner)
 */
exports.updatePost = async (req, res) => {
  const { _id } = req.query;
  const { title, description } = req.body;
  const { userId } = req.user; // From JWT token
  try {
    // Validate input data using Joi schema
    const { error, value } = createPostSchema.validate({
      title,
      description,
      userId,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    // Find the post to update
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found!" });
    }
    
    // Check if user owns the post (authorization)
    if (existingPost.userId.toString() !== userId) {
      return res.status(401).json({ success: false, message: "Unauthorized!" });
    }
    
    // Update post fields
    ((existingPost.title = title), (existingPost.description = description));
    const result = await existingPost.save();
    
    res
      .status(200)
      .json({ success: true, message: "post updated", data: result });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Delete Post Handler
 * Deletes an existing post (only by the post owner)
 */
exports.deletePost = async (req, res) => {
  const { _id } = req.query;
  const { userId } = req.user; // From JWT token
  try {
    // Find the post to delete
    const existingPost = await Post.findOne({ _id });
    if (!existingPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found already!" });
    }
    
    // Check if user owns the post (authorization)
    if (existingPost.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized!" });
    }
    
    // Delete the post from database
    await Post.deleteOne({ _id });
    res.status(200).json({ success: true, message: "post deleted" });
  } catch (error) {
    console.log(error);
  }
};
