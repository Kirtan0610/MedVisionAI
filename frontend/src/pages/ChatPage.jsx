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

function Message({ msg, dark }) {
  const isUser = msg.role === "user";
  const muted = dark ? "text-slate-400" : "text-slate-500";
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
    { role: "assistant", content: "Namaste! I'm Dr. MedVision 🩺\n\nAsk me anything about your health reports, symptoms, or medical conditions. I'll explain everything in simple terms — like a family doctor would!\n\nYou can switch to Hindi below if you prefer." }
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
  const inputBg = dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500";
  const chipBg  = dark ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600";

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 animate-fadeInDown">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-0.5">AI Assistant</p>
          <h1 className="font-bold text-xl" style={{ fontFamily:"'Sora',sans-serif" }}>Ask Dr. MedVision</h1>
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
          placeholder={language === "hi" ? "Apna sawaal likhein…" : "Ask anything about health or your reports…"}
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
