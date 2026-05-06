const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Story = require("../models/Story");
const Message = require("../models/Message");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const prevMonth = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalPosts,
    totalComments,
    totalStories,
    totalMessages,
    newUsersThisMonth,
    newUsersPrevMonth,
    newPostsThisMonth,
    newPostsPrevMonth,
    recentUsers,
    recentPosts,
    // Daily signups for last 7 days
    dailySignups,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments(),
    Story.countDocuments(),
    Message.countDocuments(),
    User.countDocuments({ createdAt: { $gte: last30Days } }),
    User.countDocuments({ createdAt: { $gte: prevMonth, $lt: last30Days } }),
    Post.countDocuments({ createdAt: { $gte: last30Days } }),
    Post.countDocuments({ createdAt: { $gte: prevMonth, $lt: last30Days } }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username fullName avatar createdAt role email"),
    Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "username fullName avatar")
      .select("content author createdAt likes"),
    User.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build last 7 days array with zeros for missing days
  const signupMap = {};
  dailySignups.forEach((d) => { signupMap[d._id] = d.count; });
  const signupChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    signupChart.push({ date: key, count: signupMap[key] || 0 });
  }

  const userGrowth = newUsersPrevMonth > 0
    ? Math.round(((newUsersThisMonth - newUsersPrevMonth) / newUsersPrevMonth) * 100)
    : 100;
  const postGrowth = newPostsPrevMonth > 0
    ? Math.round(((newPostsThisMonth - newPostsPrevMonth) / newPostsPrevMonth) * 100)
    : 100;

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalPosts,
      totalComments,
      totalStories,
      totalMessages,
      newUsersThisMonth,
      newPostsThisMonth,
      userGrowth,
      postGrowth,
    },
    recentUsers,
    recentPosts,
    signupChart,
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
``
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
