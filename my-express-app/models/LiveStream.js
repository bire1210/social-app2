const mongoose = require("mongoose");

const liveStreamSchema = new mongoose.Schema(
  {
    streamer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 500 },
    thumbnail: { type: String, default: "" },
    isLive: { type: Boolean, default: true },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewerCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

liveStreamSchema.index({ streamer: 1, isLive: 1 });
liveStreamSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LiveStream", liveStreamSchema);
