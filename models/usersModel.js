const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: [true, "Email must be unique!"],
      miniLength: [5, "Email must have 5 characters!"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must have 8 characters!"],
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

/*
{
    "email":"mohankumarwks@gmail.com",
    "password":"MoMo9500wzxy_#"
}
*/
/*
 {
    "email":"mohan123@gmail.com",
    "password":"MoMo9500abcd_#"
}
*/

/*
{
    "success":true,
    "message":"You have been logged in successfully","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGNmY2UyODg5N2E2Mjg5M2QwNzhhZTgiLCJlbWFpbCI6Im1vaGFuMTIzQGdtYWlsLmNvbSIsInZlcmlmaWVkIjpmYWxzZSwiaWF0IjoxNzU4NDUxMzEyfQ.B9m66ZdkRyn7GMtHWVxJzGdDAXEjTctnQOhQBs8GEEc"}
 */

//old and new password changing for mohankumarwks@gmail.com
/*
{
    "oldPassword":"MoMo9500wzxy_#",
    "newPassword":"MoMo9500wzxy_?"
}
 */