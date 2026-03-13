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
router.use(adminAuth);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", toggleUserRole);
router.delete("/posts/:id", deleteAnyPost);

module.exports = router;
