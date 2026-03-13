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
const upload = require("../middleware/upload");

router.use(auth); // All user routes require authentication

router.get("/search", searchUsers);
router.get("/suggested", getSuggestedUsers);
router.get("/:id", getUserProfile);
router.put("/profile", upload.single("avatar"), updateProfile);
router.post("/:id/follow", toggleFollow);

module.exports = router;
