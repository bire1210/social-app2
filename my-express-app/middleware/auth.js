const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Also check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new ApiError(401, "User no longer exists");
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired");
    }
    throw error;
  }
});

module.exports = auth;
