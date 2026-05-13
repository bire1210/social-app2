const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controller/commentController");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");

// Middleware to handle optional file upload
const handleFileUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // If it's a multer error, pass it to error handler
      return next(err);
    }
    next();
  });
};

// Public routes (guests can read comments)
router.get("/:postId", optionalAuth, getComments);

// Private routes (require authentication)
router.post("/:postId", auth, handleFileUpload, addComment);
router.delete("/:id", auth, deleteComment);

module.exports = router;
