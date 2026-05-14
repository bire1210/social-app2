const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
} = require("../controller/authController");
const auth = require("../middleware/auth");

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", auth, logout)
  .get("/me", auth, getMe);

module.exports = router;
