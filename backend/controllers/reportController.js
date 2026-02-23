const Report = require("../models/Report");
const PDFParser = require("pdf2json");
const OpenAI = require("openai");
const fs = require("fs");
const crypto = require("crypto");

// 🔥 Groq Setup (OpenAI Compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Shared AI prompt builder ───
function buildPrompt(textForAI, language = "en") {
  const isHindi = language === "hi";
  const system = isHindi
    ? `Aap Dr. MedVision hain — ek caring, experienced family physician jo hindi mein clearly baat karte hain.
Aap patients se bilkul ghar ke doctor ki tarah baat karte hain — simple, dil se, bina daraye.
Aap SIRF ek valid JSON object return karein — koi extra text, markdown, ya explanation nahi.`
    : `You are Dr. MedVision, a warm, caring, and highly experienced family physician.
You speak directly to patients as if they are a close family member — simple, compassionate, non-alarming.
You MUST respond with ONLY a valid JSON object — no extra text, no markdown, no explanation before or after.`;

  return {
    system,
    user: `Analyze this medical report and respond ONLY with a valid JSON object in this exact format:

{
  "patientSummary": "${isHindi ? "Mrasiz ke liye warm 2-3 sentence summary hindi mein" : "A warm, 2-3 sentence summary written directly to the patient in simple terms."}",
  "overallHealth": "Good|Fair|Needs Attention|Critical",
  "riskLevel": "Low|Medium|High",
  "riskScore": <number 0-100>,
  "keyFindings": [
    {
      "parameter": "parameter name",
      "value": "reported value with unit",
      "normalRange": "normal range",
      "status": "Normal|Borderline|Abnormal",
      "doctorNote": "${isHindi ? "Simple doctor wali explanation hindi mein" : "Simple explanation a doctor gives to a family member"}"
    }
  ],
  "doctorAdvice": {
    "diet": ["diet advice 1", "diet advice 2", "diet advice 3"],
    "lifestyle": ["lifestyle advice 1", "lifestyle advice 2", "lifestyle advice 3"],
    "followUp": "When and why to follow up with a doctor",
    "urgency": "No rush|Within a month|Within a week|See doctor today"
  },
  "recommendedMedicines": [
    {
      "name": "Medicine or supplement name",
      "type": "Supplement|OTC Medicine|Prescription Required",
      "reason": "Why this helps based on findings",
      "dosage": "Typical dosage",
      "caution": "Important caution",
      "requiresConsultation": true
    }
  ],
  "goodNews": "${isHindi ? "Ek achhi baat report ke baare mein hindi mein" : "One positive thing about the report."}",
  "watchOut": "${isHindi ? "Sabse zaroori dhyan rakhne wali baat hindi mein" : "Most important thing to watch out for."}",
  "disclaimer": "Important: Always consult your doctor before starting any medication."
}

Medical Report:
${textForAI}`,
  };
}

// ─── Helper: Run AI & parse JSON ───
async function runAI(textForAI, language = "en") {
  const { system, user } = buildPrompt(textForAI, language);
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user",   content: user },
    ],
    temperature: 0.4,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content;
  let parsed = null;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch {}
  return { raw, parsed };
}

// ─── Upload Report ───
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const filePath = req.file.path;
    const language = req.body.language || "en";
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      try { fs.unlinkSync(filePath); } catch {}
      return res.status(500).json({ message: "PDF parsing error. Ensure file is text-based." });
    });

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        let extractedText = "";
        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((text) => {
            text.R.forEach((run) => { extractedText += decodeURIComponent(run.T) + " "; });
          });
        });
        extractedText = extractedText.trim();

        if (!extractedText || extractedText.length < 30) {
          try { fs.unlinkSync(filePath); } catch {}
          return res.status(400).json({ message: "Could not extract text. File may be image-based or empty." });
        }

        const textForAI = extractedText.slice(0, 6000);
        const { raw, parsed } = await runAI(textForAI, language);

        const report = await Report.create({
          userId: req.user.id,
          originalFileName: req.file.originalname,
          extractedText: extractedText.slice(0, 3000),
          aiResult: parsed ? JSON.stringify(parsed) : raw,
          isStructured: parsed !== null,
          language,
        });

        try { fs.unlinkSync(filePath); } catch {}
        res.status(201).json(report);
      } catch (err) {
        try { fs.unlinkSync(filePath); } catch {}
        res.status(500).json({ message: "AI processing error: " + err.message });
      }
    });

    pdfParser.loadPDF(filePath);
  } catch (error) {
    res.status(500).json({ message: "Error processing report" });
  }
};

// ─── Get All Reports ───
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch {
    res.status(500).json({ message: "Error fetching reports" });
  }
};

// ─── Get Single Report ───
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch {
    res.status(500).json({ message: "Error fetching report" });
  }
};

// ─── Delete Report ───
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting report" });
  }
};

// ─── Re-analyze Report ───
exports.reanalyzeReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (!report.extractedText) return res.status(400).json({ message: "No extracted text to re-analyze" });

    const language = req.body.language || report.language || "en";
    const { raw, parsed } = await runAI(report.extractedText, language);

    report.aiResult = parsed ? JSON.stringify(parsed) : raw;
    report.isStructured = parsed !== null;
    report.language = language;
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Re-analysis error: " + err.message });
  }
};

// ─── Generate Share Token ───
exports.shareReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Generate or reuse share token
    if (!report.shareToken) {
      report.shareToken = crypto.randomBytes(16).toString("hex");
      await report.save();
    }
    res.json({ shareToken: report.shareToken, reportId: report._id });
  } catch {
    res.status(500).json({ message: "Error generating share link" });
  }
};

// ─── Get Shared Report (Public) ───
exports.getSharedReport = async (req, res) => {
  try {
    const report = await Report.findOne({ shareToken: req.params.token }).select("-extractedText -userId");
    if (!report) return res.status(404).json({ message: "Shared report not found or link expired" });
    res.json(report);
  } catch {
    res.status(500).json({ message: "Error fetching shared report" });
  }
};
