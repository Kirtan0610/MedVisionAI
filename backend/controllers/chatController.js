const OpenAI = require("openai");

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Keywords to detect non-health topics quickly on server side
const NON_HEALTH_TOPICS = [
  "cricket", "football", "sports score",
  "movie", "film", "song", "music",
  "recipe", "cook", "stock", "share market",
  "politics", "election", "news", "weather",
  "joke", "funny", "meme", "game", "gaming",
  "travel", "hotel", "flight", "visa",
  "relationship", "love", "marriage", "divorce",
  "coding", "programming", "software", "javascript", "python",
  "essay", "write story", "poem",
];

function isNonHealthQuery(message) {
  const lower = message.toLowerCase();
  return NON_HEALTH_TOPICS.some((kw) => lower.includes(kw));
}

// POST /api/chat
exports.chat = async (req, res) => {
  try {
    const { message, reportContext, language = "en" } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const isHindi = language === "hi";

    // Quick pre-check for obvious non-health queries
    if (isNonHealthQuery(message)) {
      const refusal = isHindi
        ? "❌ Maafi chahta hoon! Main sirf health, medical reports, symptoms, dawaiyon aur bimariyon se related sawaalon ka jawab de sakta hoon.\n\nKripya apne swasthy se related koi sawaal poochein. 🩺"
        : "❌ Sorry! I can only answer questions related to health, medical reports, symptoms, medicines, and diseases.\n\nPlease ask me a health-related question. 🩺";
      return res.json({ reply: refusal, isOffTopic: true });
    }

    const systemPrompt = isHindi
      ? `Aap Dr. MedVision hain — ek caring, experienced family doctor jo hindi mein baat karte hain.
Aap patients se bilkul family member ki tarah baat karte hain — simple, dil se, bina daraye.
Aap SIRF aur SIRF health, medical, symptoms, bimariyon, dawaiyon aur lab reports se related sawaalon ka jawab dete hain.
Agar koi non-health topic pooche jaise cricket, movies, politics, coding, recipes etc. to politely refuse karein aur kehein:
"❌ Yeh sawaal main nahi answer kar sakta. Main sirf health se related sawaalon ka jawab deta hoon. Kripya apni sehat se sambandhit kuch poochein. 🩺"
Agar report ka context diya gaya hai, to use dhyan mein rakhte hue jawab dein.
Hamesha yaad dilayein ki yeh sirf general advice hai, asli doctor se milna zaroori hai.`
      : `You are Dr. MedVision — a warm, caring, experienced family physician.
You speak directly to patients like a trusted family member — simple, compassionate, non-alarming.
You ONLY answer questions related to health, medicine, symptoms, diseases, lab reports, and wellness.
If someone asks about non-medical topics (cricket, movies, politics, coding, recipes, relationships, etc.), politely refuse by saying:
"❌ Sorry, I can only help with health and medical questions. Please ask me something related to your health, symptoms, or medical reports. 🩺"
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
