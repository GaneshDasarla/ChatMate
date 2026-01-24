const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getMessages,
  sendMessage,
  markSeen,
  getRecentChats,
} = require("../controllers/messageController");

// ✅ recent chats
router.get("/recent", protect, getRecentChats);

// ✅ get messages with a user
router.get("/:userId", protect, getMessages);

// ✅ send message
router.post("/send", protect, sendMessage);

// ✅ mark seen
router.put("/seen/:userId", protect, markSeen);

module.exports = router;
