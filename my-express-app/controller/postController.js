const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res) => {
  const postData = {
    author: req.user._id,
    content: req.body.content,
    feeling: req.body.feeling || "",
  };

  if (req.file) {
    const isVideo = req.file.mimetype.startsWith("video/");
    if (isVideo) {
      postData.video = `/uploads/${req.file.filename}`;
      postData.mediaType = "video";
    } else {
      postData.image = `/uploads/${req.file.filename}`;
      postData.mediaType = "image";
    }
  }

  const post = await Post.create(postData);

  const populatedPost = await Post.findById(post._id).populate(
    "author",
    "username fullName avatar"
  );

  res.status(201).json({
    success: true,
    post: populatedPost,
  });
});

// @desc    Get all posts (feed) from followed users + own
// @route   GET /api/posts/feed
// @access  Private
exports.getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get posts from users you follow + your own posts
  const feedUsers = [...req.user.following, req.user._id];

  const posts = await Post.find({ author: { $in: feedUsers } })
    .populate("author", "username fullName avatar")
    .populate({
      path: "comments",
      options: { limit: 3, sort: { createdAt: -1 } },
      populate: { path: "author", select: "username fullName avatar" },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Attach userReaction for each post
  const postsWithReaction = posts.map((post) => {
    const obj = post.toObject({ virtuals: true });
    const r = post.reactions.find((r) => r.user.toString() === req.user._id.toString());
    obj.userReaction = r ? r.type : null;
    return obj;
  });

  const total = await Post.countDocuments({ author: { $in: feedUsers } });

  res.status(200).json({
    success: true,
    posts: postsWithReaction,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all posts (explore - from all users)
// @route   GET /api/posts/explore
// @access  Private
exports.getExplorePosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments();

  res.status(200).json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Private
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username fullName avatar")
    .populate({
      path: "comments",
      populate: { path: "author", select: "username fullName avatar" },
      options: { sort: { createdAt: -1 } },
    });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json({
    success: true,
    post,
  });
});

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:userId
// @access  Private
exports.getUserPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ author: req.params.userId })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments({ author: req.params.userId });

  res.status(200).json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Edit a post
// @route   PUT /api/posts/:id
// @access  Private
exports.editPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this post");
  }

  if (!req.body.content || !req.body.content.trim()) {
    throw new ApiError(400, "Post content is required");
  }

  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content.trim(), isEdited: true },
    { new: true, runValidators: true }
  ).populate("author", "username fullName avatar");

  res.status(200).json({ success: true, post: updated });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

// @desc    React to a post (like, love, haha, wow, sad, angry) or remove reaction
// @route   POST /api/posts/:id/react
// @access  Private
exports.reactToPost = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const validTypes = ["like", "love", "haha", "wow", "sad", "angry"];

  if (!type || !validTypes.includes(type)) {
    throw new ApiError(400, "Invalid reaction type");
  }

  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const existingIndex = post.reactions.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  let userReaction = null;

  if (existingIndex !== -1) {
    if (post.reactions[existingIndex].type === type) {
      // Same reaction — remove it
      post.reactions.splice(existingIndex, 1);
    } else {
      // Different reaction — update it
      post.reactions[existingIndex].type = type;
      userReaction = type;
    }
  } else {
    // New reaction
    post.reactions.push({ user: req.user._id, type });
    userReaction = type;

    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "like",
        post: post._id,
      });
    }
  }

  await post.save();

  const reactionCounts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  post.reactions.forEach((r) => { reactionCounts[r.type]++; });

  res.status(200).json({
    success: true,
    userReaction,
    reactionCounts,
    totalReactions: post.reactions.length,
  });
});

// @desc    Like / Unlike a post (legacy — kept for compatibility)
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError(404, "Post not found");

  const existingIndex = post.reactions.findIndex(
    (r) => r.user.toString() === req.user._id.toString()
  );

  let userReaction = null;

  if (existingIndex !== -1 && post.reactions[existingIndex].type === "like") {
    post.reactions.splice(existingIndex, 1);
  } else {
    if (existingIndex !== -1) post.reactions.splice(existingIndex, 1);
    post.reactions.push({ user: req.user._id, type: "like" });
    userReaction = "like";

    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: "like",
        post: post._id,
      });
    }
  }

  await post.save();

  res.status(200).json({
    success: true,
    isLiked: userReaction === "like",
    userReaction,
  });
});
