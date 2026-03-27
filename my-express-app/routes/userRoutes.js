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

// Static routes MUST come before /:id to avoid being swallowed
router.get("/search", optionalAuth, searchUsers);
router.get("/suggested", auth, getSuggestedUsers);

// Profile update
router.put("/profile", auth, upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), updateProfile);

// Dynamic :id routes LAST
router.get("/:id", optionalAuth, getUserProfile);
router.post("/:id/follow", auth, toggleFollow);

module.exports = router;
