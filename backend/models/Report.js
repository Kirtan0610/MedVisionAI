const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originalFileName: String,
    extractedText:    String,
    aiResult:         String,
    isStructured:     { type: Boolean, default: false },
    language:         { type: String, default: "en" },
    shareToken:       { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
