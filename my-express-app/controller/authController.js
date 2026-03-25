const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // 🔍 1. Basic validation
  if (!username || !email || !password || !fullName) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // 🧼 2. Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // 🔎 3. Check existing user
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username }],
  });

  if (existingUser) {
    throw new ApiError(
      400,
      existingUser.email === normalizedEmail
        ? "Email already registered"
        : "Username already taken"
    );
  }

  // 👤 4. Create user
  const user = await User.create({
    username: username.trim(),
    email: normalizedEmail,
    password,
    fullName: fullName.trim(),
  });

  // 🔐 5. Generate JWT
  const token = user.generateAuthToken();

  // 🍪 6. Set secure cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 🧹 7. Remove sensitive data
  const userObj = user.toObject();
  delete userObj.password;

  // 📤 8. Send response (NO token here!)
  res.status(201).json({
    success: true,
    user: userObj,
  });
});
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = user.generateAuthToken();

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});
