const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Report = require("../models/Report");

// GET /api/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// PUT /api/users/me — update profile (name, phone, bio, language, avatarColor)
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, phone, bio, language, avatarColor } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, bio, language, avatarColor },
      { new: true, runValidators: true }
    ).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// PUT /api/users/change-password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch {
    res.status(500).json({ message: "Error changing password" });
  }
});

// DELETE /api/users/delete — delete account + all reports
router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    await Report.deleteMany({ userId: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting account" });
  }
});

module.exports = router;
