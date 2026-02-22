const Report = require("../models/Report");
const PDFParser = require("pdf2json");
const OpenAI = require("openai");

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
      return res.status(500).json({ message: "PDF parsing error" });
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

        // Limit size to avoid token overload
        extractedText = extractedText.slice(0, 5000);

        // 🤖 Send to Groq (LLaMA 3)
        const response = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are a professional medical AI assistant.",
            },
            {
              role: "user",
              content: `
Analyze this medical report:

${extractedText}

Provide:
1. Summary
2. Abnormal values
3. Risk Level (Low/Medium/High)
4. Lifestyle suggestions
5. Disclaimer that this is AI-generated.
              `,
            },
          ],
        });

        const aiResult = response.choices[0].message.content;

        // 💾 Save to MongoDB
        const report = await Report.create({
          userId: req.user.id,
          originalFileName: req.file.originalname,
          extractedText,
          aiResult,
        });

        res.status(201).json(report);
      } catch (err) {
        console.error("AI ERROR:", err.message);
        res.status(500).json({ message: "AI processing error" });
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
    const reports = await Report.find({ userId: req.user.id });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports" });
  }
};
