const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");

const { uploadReport, getReports, getReportById, deleteReport } = require("../controllers/reportController");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

router.post("/upload", authMiddleware, upload.single("file"), uploadReport);
router.get("/", authMiddleware, getReports);
router.get("/:id", authMiddleware, getReportById);
router.delete("/:id", authMiddleware, deleteReport);

module.exports = router;
