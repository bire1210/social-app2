const ApiError = require("../utils/ApiError");
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }
};

module.exports = adminAuth;
