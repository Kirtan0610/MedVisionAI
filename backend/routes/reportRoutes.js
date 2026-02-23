const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport,
  reanalyzeReport,
  shareReport,
  getSharedReport,
} = require("../controllers/reportController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// Public
router.get("/shared/:token", getSharedReport);

// Protected
router.post("/upload",            authMiddleware, upload.single("file"), uploadReport);
router.get("/",                   authMiddleware, getReports);
router.get("/:id",                authMiddleware, getReportById);
router.delete("/:id",             authMiddleware, deleteReport);
router.post("/:id/reanalyze",     authMiddleware, reanalyzeReport);
router.post("/:id/share",         authMiddleware, shareReport);

module.exports = router;
