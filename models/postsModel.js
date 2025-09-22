/**
 * Post Database Model
 * Mongoose schema for user posts with author reference
 */

const { ref } = require("joi"); // Joi reference (unused import)
const mongoose = require("mongoose"); // MongoDB object modeling library

/**
 * Post Schema Definition
 * Defines the structure and validation rules for post documents
 */
const postSchema = new mongoose.Schema(
  {
    // Post title
    title: {
      type: String,
      required: [true, "title is required!"], // Title is mandatory
      trim: true, // Remove whitespace
    },
    // Post content/description
    description: {
      type: String,
      required: [true, "description is required!"], // Description is mandatory
      trim: true, // Remove whitespace
    },
    // Reference to the user who created the post
    userId: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: "User", // Reference to User model for population
      required: true, // User ID is mandatory
    },
  },
  { 
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

// Export the Post model for use in controllers
module.exports = mongoose.model("Post", postSchema);
