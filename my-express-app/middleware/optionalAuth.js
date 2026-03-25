const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Optional authentication middleware.
 * Sets req.user if a valid token is present, but does NOT
 * reject the request if no token or an invalid token is found.
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      // Invalid or expired token — treat as guest
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

module.exports = optionalAuth;
