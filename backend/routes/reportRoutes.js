const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const { uploadReport, getReports } = require("../controllers/reportController");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("file"), uploadReport);
router.get("/", authMiddleware, getReports);

module.exports = router; // ✅ VERY IMPORTANT
