const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [500, "Post content cannot exceed 500 characters"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
postSchema.virtual("likesCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual("commentsCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

// Index for faster feed queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
