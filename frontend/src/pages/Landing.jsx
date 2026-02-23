import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const FEATURES = [
  { icon: "🔬", title: "AI-Powered Analysis",    desc: "LLaMA-3 AI reads your lab report and identifies abnormal values instantly." },
  { icon: "🩺", title: "Doctor-Style Advice",    desc: "Plain-English summaries — complex medical findings explained simply." },
  { icon: "💊", title: "Medicine Suggestions",   desc: "Relevant supplements and medicines to discuss with your physician." },
  { icon: "📊", title: "Visual Risk Insights",   desc: "Risk scores, health meters and per-parameter status at a glance." },
  { icon: "📱", title: "Fully Responsive",       desc: "Seamless experience across mobile, tablet and desktop." },
  { icon: "🔒", title: "Private & Secure",       desc: "End-to-end encrypted. Your data is yours — deletable anytime." },
];

export default function Landing() {
  const { dark } = useTheme();

  const bg     = dark ? "bg-slate-950 text-slate-100"   : "bg-white text-slate-900";
  const nav    = dark ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200";
  const card   = dark ? "bg-slate-900 border-slate-800 hover:border-blue-500/50"
                      : "bg-slate-50 border-slate-200 hover:border-blue-400";
  const muted  = dark ? "text-slate-400" : "text-slate-500";
  const chip   = dark ? "bg-blue-600/15 border-blue-500/30 text-blue-400"
                      : "bg-blue-50 border-blue-200 text-blue-600";
  const proof  = dark ? "bg-slate-900 border-slate-800 text-slate-300"
                      : "bg-slate-50 border-slate-200 text-slate-600";
  const step   = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const divider = dark ? "border-slate-800" : "border-slate-200";
  const footer = dark ? "border-slate-800 text-slate-600" : "border-slate-200 text-slate-400";
  const ghostBtn = dark
    ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
    : "border-slate-300 text-slate-700 hover:bg-slate-100";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300 overflow-x-hidden`} style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Subtle bg mesh — dark only */}
      {dark && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #0ea5e9 0%, transparent 50%)" }} />
      )}

      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 h-16 border-b ${nav} backdrop-blur-md transition-colors animate-fadeInDown`}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">M</div>
          <span className="font-semibold text-sm tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            MedVision <span className="text-blue-500">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/login"
            className={`hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${ghostBtn}`}>
            Sign In
          </Link>
          <Link to="/register"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="text-center px-4 pt-24 pb-16 max-w-3xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider mb-6 animate-fadeInUp ${chip}`}>
          <span>⬤</span> AI Health Intelligence Platform
        </div>

        <h1 className="font-black leading-[1.1] mb-5 animate-fadeInUp delay-75"
          style={{ fontFamily: "'Sora', sans-serif", fontSize: "clamp(2rem, 6vw, 3.75rem)" }}>
          Medical Reports.<br />
          <span className="gradient-text">Explained Clearly.</span>
        </h1>

        <p className={`text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8 animate-fadeInUp delay-100 ${muted}`}>
          Upload your lab report and MedVision AI explains every value — like a doctor talking directly to you — with clear insights and medicine suggestions.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fadeInUp delay-150">
          <Link to="/register"
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-sm">
            Analyze Report Free →
          </Link>
          <Link to="/login"
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm border transition-all duration-200 ${ghostBtn}`}>
            Sign In
          </Link>
        </div>

        {/* Social proof */}
        <div className={`mt-10 inline-flex items-center gap-3 px-5 py-3 rounded-xl border text-sm animate-fadeInUp delay-200 ${proof}`}>
          <div className="flex -space-x-2">
            {["A","B","C","D"].map((l, i) => (
              <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold text-white bg-blue-600 border-2 ${dark ? "border-slate-900" : "border-white"}`}>{l}</div>
            ))}
          </div>
          <span className={muted}>Trusted by <strong className={dark ? "text-slate-200" : "text-slate-700"}>850+ users</strong></span>
        </div>
      </section>

      {/* Divider */}
      <div className={`max-w-5xl mx-auto px-4 mb-16 border-b ${divider}`} />

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-bold mb-3 animate-fadeInUp" style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.5rem,4vw,2rem)" }}>
            Why MedVision AI?
          </h2>
          <p className={`text-sm ${muted} animate-fadeInUp delay-75`}>Everything you need to understand your health in one place.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className={`p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 animate-fadeInUp ${card}`}
              style={{ animationDelay: `${i * 70}ms` }}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${dark ? "bg-slate-800" : "bg-blue-50"}`}>{f.icon}</div>
              <h3 className={`font-semibold text-sm mb-1 ${dark ? "text-slate-100" : "text-slate-800"}`}>{f.title}</h3>
              <p className={`text-xs leading-relaxed ${muted}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="font-bold text-center mb-12 animate-fadeInUp" style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.4rem,3vw,1.8rem)" }}>
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className={`hidden md:block absolute top-8 left-[18%] right-[18%] h-px ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
          {[
            { n:"01", icon:"📤", t:"Upload PDF",           d:"Blood test, CBC, lipid panel, thyroid — any standard lab report." },
            { n:"02", icon:"🤖", t:"AI Analyzes",          d:"LLaMA-3 extracts, compares and evaluates all parameters." },
            { n:"03", icon:"🩺", t:"Get Clear Insights",   d:"Simple explanation, diet tips, and medicine suggestions." },
          ].map((s, i) => (
            <div key={i} className={`flex flex-col items-center text-center px-4 animate-fadeInUp`} style={{ animationDelay:`${i*100}ms` }}>
              <div className={`relative w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 border ${step}`}>
                {s.icon}
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-[0.6rem] font-black flex items-center justify-center">{s.n}</span>
              </div>
              <h3 className={`font-semibold text-sm mb-1.5 ${dark ? "text-slate-100" : "text-slate-800"}`}>{s.t}</h3>
              <p className={`text-xs leading-relaxed ${muted}`}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto gradient-bg rounded-2xl p-8 sm:p-12 text-center animate-fadeInUp">
          <h2 className="font-black text-white mb-3" style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(1.4rem,3vw,2rem)" }}>
            Your AI Health Companion
          </h2>
          <p className="text-white/75 text-sm mb-7 max-w-md mx-auto">
            Upload any medical report and get a doctor-level explanation in seconds.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-blue-700 bg-white hover:bg-slate-50 transition-all duration-200 text-sm">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-center px-4 py-5 border-t text-xs ${footer}`}>
        © 2025 MedVision AI · Not a substitute for professional medical advice
      </footer>
    </div>
  );
}
