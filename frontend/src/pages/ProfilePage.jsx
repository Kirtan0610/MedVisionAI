import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    Promise.all([
      API.get("/users/me", { headers: { Authorization: `Bearer ${user.token}` } }),
      API.get("/reports",  { headers: { Authorization: `Bearer ${user.token}` } }),
    ]).then(([u, r]) => { setProfile(u.data); setReports(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const riskC = { Low:0, Medium:0, High:0 };
  reports.forEach(r => { try { const p = JSON.parse(r.aiResult); if (riskC[p.riskLevel] !== undefined) riskC[p.riskLevel]++; } catch {} });

  const initial  = profile?.name?.charAt(0)?.toUpperCase() || "U";
  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "";

  const card   = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted  = dark ? "text-slate-400" : "text-slate-500";
  const sub    = dark ? "text-slate-600" : "text-slate-400";
  const secH   = dark ? "text-slate-300" : "text-slate-700";
  const tagBg  = dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500";
  const rowHov = dark ? "border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200";

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-3">
      {[140,90,90,110].map((h,i) => <div key={i} className="skeleton rounded-xl" style={{ height:h }} />)}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div className="animate-fadeInUp">
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-blue-500">Account</p>
        <h1 className="font-bold text-2xl" style={{ fontFamily:"'Sora',sans-serif" }}>My Profile</h1>
      </div>

      {/* Profile card */}
      <div className={`rounded-xl border p-5 sm:p-6 animate-fadeInUp delay-75 ${card}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initial}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className={`font-bold text-xl mb-0.5 ${dark ? "text-slate-100" : "text-slate-800"}`}>{profile?.name}</h2>
            <p className={`text-sm mb-3 ${muted}`}>{profile?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
              <span className={`text-[0.65rem] font-medium px-2.5 py-1 rounded border ${tagBg}`}>✓ Verified</span>
              <span className={`text-[0.65rem] font-medium px-2.5 py-1 rounded border ${tagBg}`}>AI Enabled</span>
              <span className={`text-[0.65rem] font-medium px-2.5 py-1 rounded border ${tagBg}`}>Member since {joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-4 divide-x ${dark ? "divide-slate-800" : "divide-slate-100"} rounded-xl border overflow-hidden animate-fadeInUp delay-100 ${card}`}>
        {[
          { l:"Total",  v:reports.length, c:"text-blue-500" },
          { l:"Low",    v:riskC.Low,      c:"text-emerald-500" },
          { l:"Medium", v:riskC.Medium,   c:"text-amber-500" },
          { l:"High",   v:riskC.High,     c:"text-red-500" },
        ].map((s,i) => (
          <div key={i} className="py-4 text-center">
            <p className={`font-bold text-xl ${s.c}`} style={{ fontFamily:"'Sora',sans-serif" }}>{s.v}</p>
            <p className={`text-[0.65rem] font-medium mt-0.5 ${muted}`}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      {reports.length > 0 && (
        <div className={`rounded-xl border p-5 animate-fadeInUp delay-150 ${card}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-semibold text-sm ${secH}`} style={{ fontFamily:"'Sora',sans-serif" }}>Recent Activity</h2>
            <Link to="/reports" className="text-xs font-medium text-blue-500 hover:text-blue-400">View all →</Link>
          </div>
          <div className="space-y-1.5">
            {reports.slice(0,5).map((r,i) => {
              let parsed = null; try { parsed = JSON.parse(r.aiResult); } catch {}
              const risk = parsed?.riskLevel || "–";
              const rColor = risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#10b981";
              return (
                <Link key={r._id} to={`/report/${r._id}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 animate-slideInLeft ${rowHov}`}
                  style={{ animationDelay:`${i*45}ms` }}>
                  <span className={`text-xs font-mono ${sub}`}>{String(i+1).padStart(2,"0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${dark ? "text-slate-300" : "text-slate-700"}`}>{r.originalFileName}</p>
                    <p className={`text-[0.65rem] ${sub}`}>{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                  </div>
                  {risk !== "–" && (
                    <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded shrink-0 uppercase"
                      style={{ color:rColor, background:`${rColor}18`, border:`1px solid ${rColor}30` }}>
                      {risk}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy */}
      <div className={`rounded-xl border p-5 animate-fadeInUp delay-200 ${card}`}>
        <h2 className={`font-semibold text-sm mb-3 ${secH}`} style={{ fontFamily:"'Sora',sans-serif" }}>Privacy & Data</h2>
        <div className="space-y-2">
          {[
            "Your medical data is end-to-end encrypted",
            "Uploaded PDFs are deleted immediately after analysis",
            "Only you can access your reports",
            "Delete any report permanently at any time",
          ].map((text,i) => (
            <div key={i} className={`flex gap-2.5 items-center p-2.5 rounded-lg text-xs ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
              <span className="text-emerald-500 font-bold shrink-0">✓</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5 animate-fadeInUp delay-300">
        <Link to="/upload"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
          + Analyze Report
        </Link>
        <button onClick={() => { logout(); navigate("/login"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all duration-200
            ${dark ? "border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15"
                   : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
