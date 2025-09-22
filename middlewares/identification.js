/**
 * JWT Authentication Middleware
 * Verifies JWT tokens from either headers or cookies and adds user info to request
 */

const jwt = require("jsonwebtoken"); // JWT token verification library

/**
 * Authentication Middleware Function
 * Extracts and verifies JWT token, adds user data to request object
 */
exports.idenifier = (req, res, next) => {
  let token;
  
  // Check token source based on client type
  if (req.headers.client === "not-browser") {
    // For API clients (mobile apps, Postman, etc.)
    token = req.headers.authorization;
  } else {
    // For browser clients (web apps)
    token = req.cookies.Authorization;
  }
  
  // Check if token exists
  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "User is Unauthorized" });
  }
  
  try {
    // Extract token from "Bearer <token>" format
    const userToken = token.split(" ")[1];
    
    // Verify JWT token using secret key
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
    
    if (jwtVerified) {
      // Add decoded user information to request object
      req.user = jwtVerified;
      next(); // Continue to next middleware/route handler
    } else {
      throw new Error("Invalid token");
    }
  } catch (error) {
    console.log(error);
    // TODO: Send proper error response to client
  }
};
