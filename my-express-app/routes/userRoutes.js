const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleFollow,
  searchUsers,
  getSuggestedUsers,
} = require("../controller/userController");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");

// Public routes (guests can browse)
router.get("/search", optionalAuth, searchUsers);
router.get("/:id", optionalAuth, getUserProfile);

// Private routes (require authentication)
router.get("/suggested", auth, getSuggestedUsers);
router.put("/profile", auth, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), updateProfile);
router.post("/:id/follow", auth, toggleFollow);

module.exports = router;
