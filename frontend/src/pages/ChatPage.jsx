import { useState, useContext, useRef, useEffect } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";

const SUGGESTIONS = [
  "What does high creatinine mean?",
  "Is my cholesterol level dangerous?",
  "What foods should I eat for diabetes?",
  "How does high uric acid affect my body?",
  "What is a normal blood sugar level?",
  "Can I exercise with high blood pressure?",
];

// ── Health topic keywords (must include at least one) ──
const HEALTH_KEYWORDS = [
  "health", "blood", "sugar", "pressure", "cholesterol", "diabetes",
  "thyroid", "kidney", "liver", "heart", "cancer", "fever", "cold",
  "symptom", "medicine", "drug", "tablet", "tablet", "dose", "dosage",
  "vitamin", "protein", "hemoglobin", "creatinine", "uric", "acid",
  "bmi", "weight", "diet", "exercise", "sleep", "stress", "pain",
  "report", "test", "lab", "scan", "xray", "x-ray", "mri", "urine",
  "bone", "joint", "muscle", "lung", "stomach", "allergy", "infection",
  "bacteria", "virus", "vaccine", "injection", "hospital", "doctor",
  "nurse", "physician", "clinic", "medical", "treatment", "therapy",
  "disease", "disorder", "condition", "diagnosis", "prescription",
  "swelling", "rash", "nausea", "vomit", "diarrhea", "constipation",
  "headache", "migraine", "depression", "anxiety", "mental",
  "sehat", "dawai", "bimari", "dard", "bukhar", "sugar", "bp",
  "nuskha", "ilaj", "doctor", "report", "khoon", "peshab",
  "normal", "abnormal", "borderline", "risk", "safe", "dangerous",
];

// ── Non-health keywords that obviously indicate off-topic ──
const OFF_TOPIC_KEYWORDS = [
  "cricket", "football", "ipl", "match", "score", "movie", "film",
  "song", "music", "lyrics", "recipe", "cook", "food recipe",
  "stock market", "share", "sensex", "nifty", "politics", "election",
  "party", "minister", "pm", "cm", "joke", "funny", "meme",
  "game", "gaming", "pubg", "free fire", "travel", "hotel", "flight",
  "visa", "relationship advice", "love", "breakup",
  "coding", "programming", "javascript", "python", "html", "css",
  "write essay", "write story", "poem", "weather", "rain", "temperature",
];

function isHealthRelated(text) {
  const lower = text.toLowerCase();
  // If obviously off-topic keyword found → reject
  if (OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  // If health keyword found → allow
  if (HEALTH_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  // Short generic questions like "what is this?" — allow (AI will decide)
  if (lower.split(" ").length <= 6) return true;
  return false;
}

function Message({ msg, dark }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  const muted = dark ? "text-slate-400" : "text-slate-500";

  if (isSystem) {
    return (
      <div className="flex justify-center animate-fadeInUp">
        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed border
          ${dark
            ? "bg-red-500/10 border-red-500/20 text-red-300"
            : "bg-red-50 border-red-200 text-red-700"}`}>
          <p className="font-bold text-xs uppercase tracking-wide mb-1 opacity-70">
            ⚠ Health Assistant Only
          </p>
          <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fadeInUp`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">M</div>
      )}
      <div className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? "bg-blue-600 text-white rounded-tr-sm"
          : dark ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                 : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"}`}>
        {msg.content}
        {msg.loading && (
          <span className="inline-flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full dot-1" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full dot-2" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full dot-3" />
          </span>
        )}
      </div>
      {isUser && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>You</div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! I'm Dr. MedVision 🩺\n\nAsk me anything about your health reports, symptoms, or medical conditions. I'll explain everything in simple terms — like a family doctor would!\n\nYou can switch to Hindi below if you prefer.\n\n⚠️ Note: I only answer health & medical questions."
    }
  ]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text = input) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };

    // ── Frontend Health Filter ──
    if (!isHealthRelated(msg)) {
      const refusal = language === "hi"
        ? "❌ Maafi chahta hoon! Main sirf health, medical reports, symptoms, dawaiyon aur bimariyon se related sawaalon ka jawab de sakta hoon.\n\nKripya apne swasthy se related koi sawaal poochein. 🩺"
        : "❌ Sorry! I can only answer questions related to health, medical reports, symptoms, medicines, and diseases.\n\nPlease ask me a health-related question. 🩺";

      setMessages(prev => [
        ...prev,
        userMsg,
        { role: "system", content: refusal },
      ]);
      return;
    }

    const loadingMsg = { role: "assistant", content: "", loading: true };
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setLoading(true);
    try {
      const res = await API.post("/chat", { message: msg, language }, { headers: { Authorization: `Bearer ${user.token}` } });
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally { setLoading(false); }
  };

  const card    = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted   = dark ? "text-slate-400" : "text-slate-500";
  const inputBg = dark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500";
  const chipBg  = dark
    ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400"
    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600";

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 animate-fadeInDown">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-0.5">AI Health Assistant</p>
          <h1 className="font-bold text-xl" style={{ fontFamily:"'Sora',sans-serif" }}>Ask Dr. MedVision</h1>
          <p className={`text-[0.65rem] mt-0.5 ${muted}`}>🩺 Health & Medical Questions Only</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className={`flex rounded-lg border overflow-hidden text-xs font-semibold ${dark ? "border-slate-700" : "border-slate-200"}`}>
            <button onClick={() => setLanguage("en")}
              className={`px-3 py-2 transition-all ${language === "en" ? "bg-blue-600 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}>
              EN
            </button>
            <button onClick={() => setLanguage("hi")}
              className={`px-3 py-2 transition-all ${language === "hi" ? "bg-blue-600 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}>
              हिं
            </button>
          </div>
          <button onClick={() => setMessages([messages[0]])}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${dark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            Clear
          </button>
        </div>
      </div>

      {/* Health restriction notice */}
      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-3 border text-xs
        ${dark ? "bg-blue-500/8 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
        <span className="text-base">🩺</span>
        <span>
          {language === "hi"
            ? "Sirf health, report, symptoms aur dawaiyon se related sawaal poochein."
            : "Only health, medical reports, symptoms & medicine questions are accepted here."}
        </span>
      </div>

      {/* Chat window */}
      <div className={`flex-1 rounded-xl border overflow-y-auto p-4 space-y-4 ${card}`} style={{ minHeight: 0 }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} dark={dark} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only show at start) */}
      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap mt-3 animate-fadeInUp">
          {SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 text-left ${chipBg}`}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={`flex gap-2 mt-3 p-3 rounded-xl border ${card}`}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={language === "hi" ? "Apni sehat se juda sawaal likhein…" : "Ask about health, symptoms, reports, medicines…"}
          className={`flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 ${inputBg}`}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0">
          {loading ? <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner block" /> : "Send"}
        </button>
      </div>
      <p className={`text-[0.65rem] text-center mt-2 ${muted}`}>
        AI responses are for general guidance only. Always consult a qualified doctor for medical decisions.
      </p>
    </div>
  );
}
