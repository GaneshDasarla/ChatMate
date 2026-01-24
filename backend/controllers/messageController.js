const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");

// ✅ get messages between logged user and selected user
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, image } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message text or image required" });
    }

    let imageUrl = "";
    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "chat_app_messages",
      });
      imageUrl = uploaded.secure_url;
    }

    const msg = await Message.create({
      senderId: req.user._id,
      receiverId,
      text: text || "",
      image: imageUrl || "",
    });

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ mark messages as seen
exports.markSeen = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      { senderId: userId, receiverId: req.user._id, seen: false },
      { seen: true }
    );

    res.json({ message: "Seen updated ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ recent chats list (only users you messaged)
exports.getRecentChats = async (req, res) => {
  try {
    const myId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "_id username fullName profilePic")
      .populate("receiverId", "_id username fullName profilePic");

    const uniqueUsers = new Map();

    for (let msg of messages) {
      const otherUser =
        msg.senderId._id.toString() === myId ? msg.receiverId : msg.senderId;

      if (!uniqueUsers.has(otherUser._id.toString())) {
        uniqueUsers.set(otherUser._id.toString(), otherUser);
      }
    }

    res.json([...uniqueUsers.values()]);
  } catch (error) {
    res.status(500).json({ message: "Failed to get recent chats" });
  }
};
