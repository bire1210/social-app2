const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  toggleUserRole,
  deleteAnyPost,
} = require("../controller/adminController");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// All admin routes require auth + admin role
router.use(auth);

// Temp: Make current user admin (remove after testing)
router.post("/make-me-admin", async (req, res) => {
  try {
    const User = require("../models/User");
    await User.findByIdAndUpdate(req.user._id, { role: "admin" });
    res.json({ success: true, message: "You are now an admin" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.use(adminAuth);

router
  .get("/stats", getDashboardStats)
  .get("/users", getAllUsers)
  .delete("/users/:id", deleteUser)
  .put("/users/:id/role", toggleUserRole)
  .delete("/posts/:id", deleteAnyPost);

module.exports = router;
