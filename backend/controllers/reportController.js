const Report = require("../models/Report");
const PDFParser = require("pdf2json");
const OpenAI = require("openai");
const fs = require("fs");

// 🔥 Groq Setup (OpenAI Compatible)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF PARSE ERROR:", errData.parserError);
      // Clean up uploaded file
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(500).json({ message: "PDF parsing error. Please ensure the file is a valid, text-based PDF." });
    });

    pdfParser.on("pdfParser_dataReady", async (pdfData) => {
      try {
        let extractedText = "";

        // 🔎 Extract text from PDF
        pdfData.Pages.forEach((page) => {
          page.Texts.forEach((text) => {
            text.R.forEach((run) => {
              extractedText += decodeURIComponent(run.T) + " ";
            });
          });
        });

        extractedText = extractedText.trim();

        if (!extractedText || extractedText.length < 30) {
          try { fs.unlinkSync(filePath); } catch (e) {}
          return res.status(400).json({ message: "Could not extract text from PDF. The file may be image-based or empty." });
        }

        // Limit size to avoid token overload
        const textForAI = extractedText.slice(0, 6000);

        // 🤖 Send to Groq (LLaMA 3) — doctor talking to family member
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are Dr. MedVision, a warm, caring, and highly experienced family physician. 
You speak directly to patients as if they are a close family member — using simple, compassionate, non-alarming language. 
You explain complex medical findings in easy-to-understand terms, never using overly technical jargon.
You always provide actionable, practical advice.
You MUST respond with ONLY a valid JSON object — no extra text, no markdown, no explanation before or after.`,
            },
            {
              role: "user",
              content: `Analyze this medical report and respond ONLY with a valid JSON object in this exact format:

{
  "patientSummary": "A warm, 2-3 sentence summary written directly to the patient, explaining what the report shows in simple terms.",
  "overallHealth": "Good|Fair|Needs Attention|Critical",
  "riskLevel": "Low|Medium|High",
  "riskScore": <number from 0-100>,
  "keyFindings": [
    {
      "parameter": "parameter name",
      "value": "reported value with unit",
      "normalRange": "normal range",
      "status": "Normal|Borderline|Abnormal",
      "doctorNote": "Simple explanation a doctor would give to a family member"
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
      "reason": "Why this might help based on the report findings",
      "dosage": "Typical dosage (e.g. once daily, with meals)",
      "caution": "Any important caution for this medicine",
      "requiresConsultation": true
    }
  ],
  "goodNews": "One positive thing about the report, even if minor.",
  "watchOut": "The most important thing to watch out for, explained simply.",
  "disclaimer": "Important: These medicine suggestions are only for awareness. ALWAYS consult your doctor before starting any medication. Do not self-medicate."
}

Rules for recommendedMedicines:
- Suggest 2-4 medicines/supplements relevant to the abnormal findings
- ALWAYS set requiresConsultation to true
- Prefer commonly known vitamins/minerals/OTC options when possible
- If a prescription drug is truly needed, mark type as Prescription Required
- Keep reason simple and patient-friendly

Medical Report:
${textForAI}`,
            },
          ],
          temperature: 0.4,
          max_tokens: 2000,
        });

        let aiResult = response.choices[0].message.content;

        // Parse JSON to validate it
        let parsedResult;
        try {
          // Try to extract JSON if there's any surrounding text
          const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found");
          }
        } catch (parseErr) {
          console.error("JSON PARSE ERROR:", parseErr.message);
          // Fallback: store raw text if JSON parse fails
          parsedResult = null;
        }

        // 💾 Save to MongoDB
        const report = await Report.create({
          userId: req.user.id,
          originalFileName: req.file.originalname,
          extractedText: extractedText.slice(0, 3000),
          aiResult: parsedResult ? JSON.stringify(parsedResult) : aiResult,
          isStructured: parsedResult !== null,
        });

        // Clean up uploaded file
        try { fs.unlinkSync(filePath); } catch (e) {}

        res.status(201).json(report);
      } catch (err) {
        console.error("AI ERROR:", err.message);
        try { fs.unlinkSync(filePath); } catch (e) {}
        res.status(500).json({ message: "AI processing error: " + err.message });
      }
    });

    pdfParser.loadPDF(filePath);
  } catch (error) {
    console.error("UPLOAD ERROR:", error.message);
    res.status(500).json({ message: "Error processing report" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Error fetching report" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting report" });
  }
};
