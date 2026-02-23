import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function SharedReport() {
  const { token } = useParams();
  const { dark } = useTheme();
  const [report, setReport] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/reports/shared/${token}`)
      .then(res => { setReport(res.data); try { setParsed(JSON.parse(res.data.aiResult)); } catch {} setLoading(false); })
      .catch(() => { setError("This shared report was not found or the link has expired."); setLoading(false); });
  }, [token]);

  const bg    = dark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const rColor = parsed?.riskLevel === "High" ? "#ef4444" : parsed?.riskLevel === "Medium" ? "#f59e0b" : "#10b981";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`} style={{ fontFamily:"'Inter',sans-serif" }}>
      {/* Nav */}
      <nav className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 h-14 border-b ${dark ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"} backdrop-blur-md`}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">M</div>
          <span className="font-semibold text-sm" style={{ fontFamily:"'Sora',sans-serif" }}>MedVision <span className="text-blue-500">AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded border ${dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"}`}>Shared Report</span>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[150,90,110].map((h,i) => <div key={i} className="skeleton rounded-xl" style={{ height:h }} />)}
          </div>
        ) : error ? (
          <div className={`text-center py-20 rounded-xl border mt-6 ${card}`}>
            <p className="text-4xl mb-3">🔗</p>
            <p className="font-semibold text-red-400 mb-2">{error}</p>
            <Link to="/register" className="mt-4 inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">Create Free Account →</Link>
          </div>
        ) : (
          <div className="space-y-4 mt-4 animate-fadeInUp">
            {/* Header */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20">Shared Report</span>
                {parsed?.riskLevel && (
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border"
                    style={{ color:rColor, background:`${rColor}15`, borderColor:`${rColor}35` }}>
                    {parsed.riskLevel} Risk
                  </span>
                )}
              </div>
              <h1 className="font-bold text-lg mb-1" style={{ fontFamily:"'Sora',sans-serif" }}>{report?.originalFileName}</h1>
              <p className={`text-xs ${muted}`}>{new Date(report?.createdAt).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
            </div>

            {/* Doctor summary */}
            {parsed?.patientSummary && (
              <div className={`p-4 rounded-xl border ${dark ? "bg-blue-600/5 border-blue-500/15" : "bg-blue-50 border-blue-200"}`}>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">M</div>
                  <div>
                    <p className="text-blue-500 text-[0.65rem] font-bold uppercase tracking-wide mb-1">Dr. MedVision —</p>
                    <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>{parsed.patientSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Key findings */}
            {parsed?.keyFindings?.length > 0 && (
              <div className={`rounded-xl border overflow-hidden ${card}`}>
                <div className="px-5 py-3 border-b border-inherit">
                  <p className="font-semibold text-sm" style={{ fontFamily:"'Sora',sans-serif" }}>Lab Values</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className={`text-[0.6rem] uppercase tracking-wide ${dark ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-400"}`}>
                      <tr>{["Parameter","Value","Normal","Status"].map(h => <th key={h} className="px-4 py-2.5 text-left font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {parsed.keyFindings.map((f, i) => {
                        const s = f.status === "Normal" ? "text-emerald-400" : f.status === "Borderline" ? "text-amber-400" : "text-red-400";
                        return (
                          <tr key={i} className={`border-b transition-colors ${dark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}>
                            <td className={`px-4 py-3 font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>{f.parameter}</td>
                            <td className={`px-4 py-3 font-mono font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{f.value}</td>
                            <td className={`px-4 py-3 ${muted}`}>{f.normalRange}</td>
                            <td className={`px-4 py-3 font-semibold ${s}`}>{f.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Good news / watch out */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parsed?.goodNews && <div className={`rounded-xl border-l-4 border-emerald-500 p-4 ${card}`}><p className="text-emerald-500 text-xs font-semibold mb-1">✓ Good News</p><p className={`text-sm ${muted}`}>{parsed.goodNews}</p></div>}
              {parsed?.watchOut  && <div className={`rounded-xl border-l-4 border-amber-500 p-4 ${card}`}><p className="text-amber-500 text-xs font-semibold mb-1">⚠ Watch Out</p><p className={`text-sm ${muted}`}>{parsed.watchOut}</p></div>}
            </div>

            {/* Disclaimer + CTA */}
            <div className={`text-xs p-3.5 rounded-xl border ${dark ? "bg-amber-500/5 border-amber-500/15 text-amber-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
              ⚠ This is a shared AI-generated report for awareness only. Always consult a qualified doctor for medical decisions.
            </div>

            <div className={`text-center p-6 rounded-xl border ${card}`}>
              <p className={`text-sm mb-3 ${muted}`}>Want to analyze your own health reports?</p>
              <Link to="/register" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                Get Started Free →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
