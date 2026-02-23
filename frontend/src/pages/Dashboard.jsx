import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

function StatCard({ icon, label, value, color, loading, dark, delay = 0 }) {
  const card = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 animate-fadeInUp ${card}`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{icon}</span>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      </div>
      {loading
        ? <div className="skeleton h-7 w-10 rounded mb-1" />
        : <p className="font-bold text-2xl" style={{ fontFamily:"'Sora',sans-serif", color }}>{value}</p>
      }
      <p className={`text-xs font-medium mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.token) {
      API.get("/reports", { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => { setReports(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const riskCounts = { Low:0, Medium:0, High:0 };
  reports.forEach(r => { try { const p = JSON.parse(r.aiResult); if (riskCounts[p.riskLevel] !== undefined) riskCounts[p.riskLevel]++; } catch {} });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  const card   = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted  = dark ? "text-slate-400" : "text-slate-500";
  const sub    = dark ? "text-slate-400" : "text-slate-500";
  const step   = dark ? "bg-slate-800" : "bg-slate-50 border border-slate-200";
  const rowHov = dark ? "border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700"
                      : "border-slate-100 bg-slate-50 hover:border-slate-300";
  const divider = dark ? "border-slate-800" : "border-slate-100";
  const secTitle = dark ? "text-slate-300" : "text-slate-700";
  const ghostBtn = dark
    ? "border-slate-700 text-slate-300 hover:bg-slate-800"
    : "border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <div className="max-w-6xl mx-auto space-y-6" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* ─ Header ─ */}
      <div className={`rounded-xl border p-6 animate-fadeInUp ${card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${muted}`}>{greeting} ·</p>
            <h1 className="font-bold text-2xl sm:text-3xl mb-2" style={{ fontFamily:"'Sora',sans-serif" }}>
              Welcome, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className={`text-sm max-w-md leading-relaxed ${muted}`}>
              Upload a medical report and MedVision AI will explain every value clearly — including what medicines to discuss with your doctor.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              <Link to="/upload"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                + Analyze Report
              </Link>
              <Link to="/reports"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all duration-200 ${ghostBtn}`}>
                View Reports
              </Link>
            </div>
          </div>
          <div className="text-5xl animate-float shrink-0 hidden sm:block">🏥</div>
        </div>
      </div>

      {/* ─ Stats ─ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="📄" label="Reports"    value={reports.length}    color="#3b82f6" loading={loading} dark={dark} delay={0}   />
        <StatCard icon="●"  label="Low Risk"   value={riskCounts.Low}    color="#10b981" loading={loading} dark={dark} delay={60}  />
        <StatCard icon="●"  label="Med Risk"   value={riskCounts.Medium} color="#f59e0b" loading={loading} dark={dark} delay={120} />
        <StatCard icon="●"  label="High Risk"  value={riskCounts.High}   color="#ef4444" loading={loading} dark={dark} delay={180} />
      </div>

      {/* ─ Two-column section ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* How it works */}
        <div className={`rounded-xl border p-5 animate-fadeInUp delay-100 ${card}`}>
          <h2 className={`font-semibold text-sm mb-4 ${secTitle}`} style={{ fontFamily:"'Sora',sans-serif" }}>How It Works</h2>
          <div className="space-y-4">
            {[
              { n:"01", t:"Upload PDF Report",        d:"Any standard lab report — blood tests, CBC, thyroid, more." },
              { n:"02", t:"AI Reads & Evaluates",     d:"Advanced AI extracts values and identifies abnormalities." },
              { n:"03", t:"Get Plain-English Report",  d:"Clear advice, diet tips, and medicine suggestions." },
            ].map((s, i) => (
              <div key={i} className={`flex gap-3.5 animate-slideInLeft`} style={{ animationDelay:`${i*70}ms` }}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-blue-400 shrink-0 ${step}`}>{s.n}</div>
                <div>
                  <p className={`text-sm font-medium ${dark ? "text-slate-300" : "text-slate-800"}`}>{s.t}</p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${muted}`}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reports */}
        <div className={`rounded-xl border p-5 animate-fadeInUp delay-150 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-sm ${secTitle}`} style={{ fontFamily:"'Sora',sans-serif" }}>Recent Reports</h2>
            {reports.length > 0 && <Link to="/reports" className="text-xs font-medium text-blue-500 hover:text-blue-400">View all →</Link>}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-center">
              <span className="text-3xl mb-2">📭</span>
              <p className={`text-sm mb-4 ${muted}`}>No reports yet</p>
              <Link to="/upload"
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                Upload First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {reports.slice(0, 5).map((r, i) => {
                let parsed = null; try { parsed = JSON.parse(r.aiResult); } catch {}
                const risk = parsed?.riskLevel || "–";
                const rColor = risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#10b981";
                return (
                  <Link to={`/report/${r._id}`} key={r._id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 animate-slideInRight ${rowHov}`}
                    style={{ animationDelay:`${i*50}ms` }}>
                    <span className={`text-xs font-mono font-semibold ${muted}`}>{String(i+1).padStart(2,"0")}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${dark ? "text-slate-300" : "text-slate-700"}`}>{r.originalFileName}</p>
                      <p className={`text-xs ${sub}`}>{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                    </div>
                    {risk !== "–" && (
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded shrink-0"
                        style={{ color: rColor, background:`${rColor}18`, border:`1px solid ${rColor}35` }}>
                        {risk}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─ CTA ─ */}
      <div className={`gradient-bg rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeInUp delay-200`}>
        <div>
          <h2 className="font-bold text-white text-lg sm:text-xl mb-1" style={{ fontFamily:"'Sora',sans-serif" }}>Ready to analyze your next report?</h2>
          <p className="text-white/70 text-sm">Upload a PDF and get your AI health report in under 30 seconds.</p>
        </div>
        <Link to="/upload"
          className="shrink-0 px-6 py-2.5 rounded-lg font-semibold text-blue-700 bg-white hover:bg-slate-50 transition-all duration-200 text-sm whitespace-nowrap">
          Analyze Now →
        </Link>
      </div>
    </div>
  );
}
