const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    originalFileName: String,
    extractedText: String,
    aiResult: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", reportSchema);
