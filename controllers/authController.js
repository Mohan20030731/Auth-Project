/**
 * Authentication Controller
 * Handles user registration, login, email verification, and password management
 */

// Import required dependencies
const Jwt = require("jsonwebtoken"); // JWT token generation and verification
const {
  signupSchema,
  signinSchema,
  acceptCodeSchema,
  changePasswordSchema,
  acceptFPCodeSchema,
} = require("../middlewares/validator"); // Joi validation schemas
const User = require("../models/usersModel"); // User database model
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing"); // Password hashing utilities
const transport = require("../middlewares/sendMail"); // Email service configuration

/**
 * User Registration Handler
 * Creates a new user account with email and hashed password
 */
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input data using Joi schema
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists!" });
    }
    
    // Hash the password with salt rounds of 10
    const hashedPassword = await doHash(password, 10);

    // Create new user instance
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    
    // Save user to database
    const result = await newUser.save();
    
    // Remove password from response for security
    result.password = undefined;
    
    res.status(201).json({
      success: true,
      message: "Your account has been created successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * User Login Handler
 * Authenticates user credentials and generates JWT token
 */
exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input data
    const { error, value } = signinSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    // Find user and include password field (normally excluded)
    const existingUser = await User.findOne({ email }).select("+password");

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }
    
    // Verify password against hashed password
    const result = await doHashValidation(password, existingUser.password);

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }
    
    // Generate JWT token with user information
    const token = Jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h", // Token expires in 8 hours
      }
    );
    
    // Set cookie and send response
    res
      .cookie("Authorization", "Bearer" + token, {
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        httpOnly: process.env.NODE_ENV === "production", // HTTP-only in production
        secure: process.env.NODE_ENV === "production", // Secure flag in production
      })
      .json({
        success: true,
        message: "You have been logged in successfully",
        token,
      });
  } catch (error) {
    console.log(error);
  }
};

/**
 * User Logout Handler
 * Clears authentication cookie to log out user
 */
exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization") // Remove authentication cookie
    .status(200)
    .json({ success: true, message: "You have been logged out successfully" });
};

/**
 * Send Email Verification Code Handler
 * Generates and sends a 6-digit verification code to user's email
 */
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist!" });
    }

    // Check if user is already verified
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified!" });
    }

    // Generate random 6-digit verification code
    const codeValue = Math.floor(Math.random() * 1000000).toString();
    
    // Send verification code via email
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Verification Code",
      text: `Your verification code is ${codeValue}`,
    });

    // Check if email was successfully sent
    if (info.accepted[0] === existingUser.email) {
      // Hash the verification code using HMAC
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      
      // Store hashed code and timestamp in database
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      console.log("Saving verification code:", hashedCodeValue);
      console.log(
        "Saving validation time:",
        existingUser.verificationCodeValidation
      );
      await existingUser.save();
      console.log("User saved successfully");
      return res.status(200).json({ success: true, message: "code sent!" });
    }
    res.status(400).json({ success: false, message: "code sent failed!" });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Verify Email Verification Code Handler
 * Validates the provided verification code and marks user as verified
 */
exports.verfiyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  console.log("Verification function called with:", { email, providedCode });
  try {
    // Validate input data
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    const codeValue = providedCode.toString();
    
    // Find user and include verification fields (normally excluded)
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    // Check if user is already verified
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified!" });
    }

    // Check if verification code exists
    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Somthing went wrong with the code!",
      });
    }

    // Check if verification code has expired (5 minutes)
    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Code expired please try again!",
      });
    }
    
    // Hash the provided code to compare with stored hash
    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    // Verify the code matches
    if (hashedCodeValue === existingUser.verificationCode) {
      // Mark user as verified and clear verification fields
      ((existingUser.verified = true),
        (existingUser.verificationCode = undefined),
        (existingUser.verificationCodeValidation = undefined),
        await existingUser.save());
      return res.status(200).json({
        success: true,
        message: "User verified successfully!",
      });
    }
    return res.status(400).json({
      success: false,
      message: "unexpected error occured!",
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Change Password Handler
 * Allows verified users to change their password by providing old password
 */
exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user; // From JWT token
  const { oldPassword, newPassword } = req.body;
  try {
    // Validate input data
    const { error, value } = changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    // Check if user is verified
    if (!verified) {
      return res
        .status(401)
        .json({ success: false, message: "you are not verified user!" });
    }
    
    // Find user and include password field
    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }
    
    // Verify old password
    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }
    
    // Hash new password with higher salt rounds for security
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    
    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully!" });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Send Forgot Password Code Handler
 * Generates and sends a password reset code to user's email
 */
exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist!" });
    }

    // Generate random 6-digit password reset code
    const codeValue = Math.floor(Math.random() * 1000000).toString();
    
    // Send password reset code via email
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Forgot Password Code",
      text: `Your verification code is ${codeValue}`,
    });

    // Check if email was successfully sent
    if (info.accepted[0] === existingUser.email) {
      // Hash the password reset code using HMAC
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      
      // Store hashed code and timestamp in database
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "code sent!" });
    }
    res.status(400).json({ success: false, message: "code sent failed!" });
  } catch (error) {
    console.log(error);
  }
};

/**
 * Verify Forgot Password Code Handler
 * Validates the password reset code and updates user's password
 */
exports.verfiyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    // Validate input data
    const { error, value } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    
    const codeValue = providedCode.toString();
    
    // Find user and include forgot password fields (normally excluded)
    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    // Check if forgot password code exists
    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Somthing went wrong with the code!",
      });
    }

    // Check if forgot password code has expired (5 minutes)
    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Code expired please try again!",
      });
    }
    
    // Hash the provided code to compare with stored hash
    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    // Verify the code matches
    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      // Hash new password and update user
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword(
        (existingUser.forgotPasswordCode = undefined),
        (existingUser.forgotPasswordCodeValidation = undefined),
        await existingUser.save()
      );
      return res.status(200).json({
        success: true,
        message: "Password Updated!",
      });
    }
    return res.status(400).json({
      success: false,
      message: "unexpected error occured!",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist!" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: "Forgot Password Code",
      text: `Your forgot password code is ${codeValue}`,
    });

    if (info.accepted[0] === existingUser.email) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({ success: true, message: "code sent!" });
    }
    res.status(400).json({ success: false, message: "code sent failed!" });
  } catch (error) {
    console.log(error);
  }
};

exports.verfiyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;
  try {
    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong with the code!",
      });
    }

    if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Code expired please try again!",
      });
    }
    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashedCodeValue === existingUser.forgotPasswordCode) {
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "Password reset successfully!",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Invalid code!",
    });
  } catch (error) {
    console.log(error);
  }
};