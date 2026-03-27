const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "username fullName avatar")
    .populate("following", "username fullName avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["fullName", "bio", "website", "location"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle avatar upload
  if (req.file) {
    updates.avatar = `/uploads/${req.file.filename}`;
  }

  // Handle cover image (sent as separate field name)
  if (req.files && req.files.coverImage) {
    updates.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
  }
  if (req.files && req.files.avatar) {
    updates.avatar = `/uploads/${req.files.avatar[0].filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Follow / Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.toggleFollow = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);

  if (!userToFollow) {
    throw new ApiError(404, "User not found");
  }

  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const isFollowing = req.user.following.includes(req.params.id);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });

    res.status(200).json({
      success: true,
      message: "Unfollowed successfully",
      isFollowing: false,
    });
  } else {
    // Follow
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $addToSet: { followers: req.user._id },
    });

    // Create notification
    await createNotification({
      recipient: req.params.id,
      sender: req.user._id,
      type: "follow",
    });

    res.status(200).json({
      success: true,
      message: "Followed successfully",
      isFollowing: true,
    });
  }
});

// @desc    Search users
// @route   GET /api/users/search?q=query
// @access  Private
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(200).json({ success: true, users: [] });
  }

  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } },
      {
        $or: [
          { username: { $regex: q, $options: "i" } },
          { fullName: { $regex: q, $options: "i" } },
        ],
      },
    ],
  })
    .select("username fullName avatar bio")
    .limit(20);

  res.status(200).json({
    success: true,
    users,
  });
});

// @desc    Get suggested users to follow
// @route   GET /api/users/suggested
// @access  Private
exports.getSuggestedUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const users = await User.find({
    _id: { $ne: req.user._id, $nin: req.user.following },
  })
    .select("username fullName avatar bio coverImage followers following")
    .limit(limit);

  res.status(200).json({
    success: true,
    users,
  });
});
