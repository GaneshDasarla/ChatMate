const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ SIGNUP (with unique username)
exports.signup = async (req, res) => {
  try {
    const { fullName, username, email, password, bio } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ check username exists
    const usernameExists = await User.findOne({
      username: username.toLowerCase(),
    });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // ✅ check email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already used" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      password: hashed,
      bio: bio || "",
    });

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CHECK AUTH
exports.checkAuth = async (req, res) => {
  try {
    // ✅ middleware already attached user in req.user
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    let uploadUrl = "";

    if (profilePic) {
      const uploaded = await cloudinary.uploader.upload(profilePic, {
        folder: "chat_app_profiles",
      });
      uploadUrl = uploaded.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(fullName && { fullName }),
        ...(bio && { bio }),
        ...(uploadUrl && { profilePic: uploadUrl }),
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ SEARCH USERS BY USERNAME (DEPLOY-SAFE)
exports.searchUsers = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const filter = {
      username: { $regex: query, $options: "i" },
    };

    // ✅ exclude logged-in user ONLY if req.user exists
    if (req.user && req.user._id) {
      filter._id = { $ne: req.user._id };
    }

    const users = await User.find(filter)
      .select("_id fullName username profilePic")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search users failed" });
  }
};
