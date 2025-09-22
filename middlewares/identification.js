const jwt = require("jsonwebtoken");

exports.idenifier = (req, res, next) => {
  let token;
  if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies.Authorization;
  }
  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "User is Unauthorized" });
  }
  try {
    const userToken = token.split(" ")[1];
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
    if (jwtVerified) {
      req.user = jwtVerified;
      next();
    } else {
      throw new Error("Invalid token");
    }
  } catch (error) {
    console.log(error);
  }
};
