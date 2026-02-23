const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    phone:       { type: String, default: "" },
    bio:         { type: String, default: "" },
    avatarColor: { type: String, default: "#2563EB" },
    language:    { type: String, default: "en", enum: ["en", "hi"] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
