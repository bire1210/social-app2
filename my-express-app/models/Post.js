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
    video: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["none", "image", "video"],
      default: "none",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["like", "love", "haha", "wow", "sad", "angry"],
        },
      },
    ],
    feeling: {
      type: String,
      default: "",
    },
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
  return this.reactions ? this.reactions.length : (this.likes ? this.likes.length : 0);
});

// Virtual for reaction counts per type
postSchema.virtual("reactionCounts").get(function () {
  const counts = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  if (this.reactions) {
    this.reactions.forEach((r) => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });
  }
  return counts;
});

// Virtual for comment count
postSchema.virtual("commentsCount").get(function () {
  return this.comments ? this.comments.length : 0;
});

// Index for faster feed queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
