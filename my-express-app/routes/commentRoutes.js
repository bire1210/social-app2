const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controller/commentController");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

// Public routes (guests can read comments)
router.get("/:postId", optionalAuth, getComments);

// Private routes (require authentication)
router.post("/:postId", auth, addComment);
router.delete("/:id", auth, deleteComment);

module.exports = router;
