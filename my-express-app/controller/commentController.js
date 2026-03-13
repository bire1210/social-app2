const Comment = require("../models/Comment");
const Post = require("../models/Post");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

// @desc    Add a comment to a post
// @route   POST /api/comments/:postId
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    author: req.user._id,
    post: req.params.postId,
    content: req.body.content,
  });

  // Add comment reference to the post
  await Post.findByIdAndUpdate(req.params.postId, {
    $push: { comments: comment._id },
  });

  // Create notification
  await createNotification({
    recipient: post.author,
    sender: req.user._id,
    type: "comment",
    post: post._id,
  });

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username fullName avatar"
  );

  res.status(201).json({
    success: true,
    comment: populatedComment,
  });
});

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
// @access  Private
exports.getComments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ post: req.params.postId })
    .populate("author", "username fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Comment.countDocuments({ post: req.params.postId });

  res.status(200).json({
    success: true,
    comments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // Remove comment reference from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id },
  });

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
