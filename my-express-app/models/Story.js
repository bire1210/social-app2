const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, default: "" },
    text: { type: String, default: "", maxlength: 200 },
    backgroundColor: { type: String, default: "#1877f2" },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index — auto-delete after 24h
storySchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Story", storySchema);
