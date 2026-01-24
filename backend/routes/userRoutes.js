const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  signup,
  login,
  checkAuth,
  updateProfile,
  searchUsers,
} = require("../controllers/userController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/check", protect, checkAuth);
router.put("/update", protect, updateProfile);

// ✅ only search users (no /all)
router.get("/search", protect, searchUsers);

module.exports = router;
