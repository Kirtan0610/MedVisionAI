const OpenAI = require("openai");

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, reportContext, language = "en" } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const isHindi = language === "hi";

    const systemPrompt = isHindi
      ? `Aap Dr. MedVision hain — ek caring, experienced family doctor jo hindi mein baat karte hain.
Aap patients se bilkul family member ki tarah baat karte hain — simple, dil se, bina daraye.
Aap medical questions ka jawab simple hindi mein dete hain, technical jargon avoid karte hain.
Agar report ka context diya gaya hai, to use dhyan mein rakhte hue jawab dein.
Hamesha yaad dilayein ki yeh sirf general advice hai, asli doctor se milna zaroori hai.`
      : `You are Dr. MedVision — a warm, caring, experienced family physician.
You speak directly to patients like a trusted family member — simple, compassionate, non-alarming.
Answer medical questions in plain English, avoiding technical jargon.
If a medical report context is provided, use it to give more personalized answers.
Always remind that this is general guidance and professional medical consultation is essential.`;

    const userMessage = reportContext
      ? `Patient's Medical Report Context:\n${reportContext}\n\nPatient's Question: ${message}`
      : message;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: 0.6,
      max_tokens: 600,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error("CHAT ERROR:", err.message);
    res.status(500).json({ message: "Chat error: " + err.message });
  }
};
