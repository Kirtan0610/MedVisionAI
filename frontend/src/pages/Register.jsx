import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Register() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true); setError("");
      await API.post("/auth/register", form);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  const pwLen = form.password.length;
  const strength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : pwLen < 14 ? 3 : 4;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-emerald-400"][strength];
  const barActive = ["bg-transparent", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"][strength];

  const bg    = dark ? "bg-slate-950" : "bg-slate-50";
  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const label = dark ? "text-slate-400" : "text-slate-500";
  const input = dark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20";
  const muted = dark ? "text-slate-500" : "text-slate-400";
  const ghost = dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${bg} transition-colors duration-300`}
      style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-scaleIn">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-5">M</div>
          <h1 className="font-bold text-xl mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Create your account</h1>
          <p className={`text-sm ${muted}`}>Join MedVision AI for free</p>
        </div>

        <div className={`rounded-2xl border p-6 ${card}`}>
          {success ? (
            <div className="text-center py-8 animate-scaleIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
              <p className="font-semibold text-emerald-400 mb-1">Account created!</p>
              <p className={`text-xs ${muted}`}>Redirecting to login…</p>
              <div className="flex justify-center gap-1.5 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dot-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dot-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dot-3" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-xs border animate-slideInLeft
                  ${dark ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Full name</label>
                <input name="name" placeholder="Your full name" value={form.name} onChange={handleChange} autoComplete="name"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 ${input}`} />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Email address</label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 ${input}`} />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Password</label>
                <div className="relative">
                  <input name="password" type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange} autoComplete="new-password"
                    className={`w-full px-3.5 py-2.5 pr-12 rounded-lg border text-sm outline-none transition-all duration-200 ${input}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium transition-colors ${ghost}`}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {pwLen > 0 && (
                  <div className="mt-1.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? barActive : dark ? "bg-slate-700" : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <p className={`text-[0.65rem] mt-1 font-medium ${strengthColor}`}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner" /> Creating…</>
                  : "Create Account"}
              </button>
            </form>
          )}

          {!success && (
            <p className={`text-center text-xs mt-5 ${muted}`}>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 font-medium hover:text-blue-400">Sign in</Link>
            </p>
          )}
        </div>

        <p className={`text-center text-xs mt-4 ${muted}`}>🔒 Your health data is encrypted</p>
      </div>
    </div>
  );
}
