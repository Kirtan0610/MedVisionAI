import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { dark } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    try {
      setLoading(true); setError("");
      const res = await API.post("/auth/login", form);
      login(res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally { setLoading(false); }
  };

  const bg    = dark ? "bg-slate-950" : "bg-slate-50";
  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const label = dark ? "text-slate-400" : "text-slate-500";
  const input = dark
    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20";
  const muted = dark ? "text-slate-500" : "text-slate-400";
  const ghost = dark
    ? "text-slate-400 hover:text-slate-200"
    : "text-slate-500 hover:text-slate-700";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 ${bg} transition-colors duration-300`}
      style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="fixed top-4 right-4 z-10"><ThemeToggle /></div>

      <div className="w-full max-w-sm animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-5">M</div>
          <h1 className="font-bold text-xl mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Sign in to MedVision</h1>
          <p className={`text-sm ${muted}`}>Your AI health analysis platform</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl border p-6 ${card}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-xs border animate-slideInLeft
                ${dark ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Email address</label>
              <input name="email" type="email" autoComplete="email"
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 ${input}`} />
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"} autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password} onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all duration-200 ${input}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${ghost}`}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner" /> Signing in…</>
                : "Sign In"}
            </button>
          </form>

          <p className={`text-center text-xs mt-5 ${muted}`}>
            No account?{" "}
            <Link to="/register" className="text-blue-500 font-medium hover:text-blue-400">Create one</Link>
          </p>
        </div>

        <p className={`text-center text-xs mt-4 ${muted}`}>🔒 Encrypted & secure</p>
      </div>
    </div>
  );
}
