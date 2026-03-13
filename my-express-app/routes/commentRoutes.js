const express = require("express");
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controller/commentController");
const auth = require("../middleware/auth");

router.use(auth);

router.post("/:postId", addComment);
router.get("/:postId", getComments);
router.delete("/:id", deleteComment);

module.exports = router;
