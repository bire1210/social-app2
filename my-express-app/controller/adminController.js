const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalPosts, totalComments, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username fullName avatar createdAt role"),
    ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalPosts,
      totalComments,
    },
    recentUsers,
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "Cannot delete an admin account");
  }

  // Delete user's posts and comments
  await Post.deleteMany({ author: req.params.id });
  await Comment.deleteMany({ author: req.params.id });
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User and associated data deleted",
  });
});

// @desc    Toggle user role (admin)
// @route   PUT /api/admin/users/:id/role
// @access  Admin
exports.toggleUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = user.role === "admin" ? "user" : "admin";
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User role updated to ${user.role}`,
    user,
  });
});

// @desc    Delete any post (admin)
// @route   DELETE /api/admin/posts/:id
// @access  Admin
exports.deleteAnyPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  await Comment.deleteMany({ post: req.params.id });
  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Post and comments deleted",
  });
});
