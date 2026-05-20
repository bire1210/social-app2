const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, trim: true, maxlength: 2000 },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "document", "file"],
      default: "text",
    },
    file: {
      url: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number }, // in bytes
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

// Validation: either content or file must be present
messageSchema.pre("save", function (next) {
  if (!this.content && !this.file?.url) {
    return next(new Error("Message must have either content or file"));
  }
  next();
});

messageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
