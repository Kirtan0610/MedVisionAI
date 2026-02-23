import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function RiskBadge({ level }) {
  const cfg = {
    Low:    "text-emerald-600 bg-emerald-500/10 border-emerald-500/25",
    Medium: "text-amber-600   bg-amber-500/10   border-amber-500/25",
    High:   "text-red-500     bg-red-500/10     border-red-500/25",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[0.65rem] font-semibold border uppercase tracking-wide ${cfg[level] || "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>
      {level || "Unknown"}
    </span>
  );
}

function ReportCard({ r, dark, delay }) {
  let parsed = null; try { parsed = JSON.parse(r.aiResult); } catch {}
  const risk     = parsed?.riskLevel;
  const health   = parsed?.overallHealth;
  const summary  = parsed?.patientSummary || r.aiResult?.replace(/\*\*/g,"").slice(0,160);
  const urgency  = parsed?.doctorAdvice?.urgency;
  const medCount = parsed?.recommendedMedicines?.length || 0;

  const card = dark
    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
    : "bg-white border-slate-200 hover:border-slate-300";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const sub   = dark ? "text-slate-600" : "text-slate-400";
  const healthColor = health === "Good" ? "text-emerald-500" : health === "Fair" ? "text-amber-500" : "text-red-400";

  return (
    <Link to={`/report/${r._id}`} className="block animate-fadeInUp" style={{ animationDelay:`${delay}ms` }}>
      <div className={`rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${card}`}>
        <div className="flex items-start gap-3.5 mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>📄</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 justify-between flex-wrap">
              <p className={`text-sm font-semibold truncate max-w-[220px] ${dark ? "text-slate-200" : "text-slate-800"}`}>{r.originalFileName}</p>
              <RiskBadge level={risk} />
            </div>
            <p className={`text-xs mt-0.5 ${sub}`}>
              {new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
              {" · "}
              {new Date(r.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
            </p>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {health && (
            <span className={`text-xs font-medium ${healthColor}`}>
              {health === "Good" ? "◎ Good Health" : health === "Fair" ? "◎ Fair Health" : "◎ Needs Attention"}
            </span>
          )}
          {medCount > 0 && (
            <span className={`text-xs font-medium ${dark ? "text-blue-400" : "text-blue-600"}`}>
              · 💊 {medCount} medicine{medCount > 1 ? "s" : ""} suggested
            </span>
          )}
        </div>

        {/* Summary */}
        <p className={`text-xs leading-relaxed line-clamp-2 ${muted}`}>{summary}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}">
          {urgency ? (
            <span className={`text-[0.65rem] font-semibold ${
              urgency.toLowerCase().includes("today") ? "text-red-400"
              : urgency.toLowerCase().includes("week") ? "text-amber-400"
              : "text-emerald-400"}`}>
              {urgency}
            </span>
          ) : <span />}
          <span className={`text-xs font-medium text-blue-500 hover:text-blue-400`}>View details →</span>
        </div>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.token) {
      API.get("/reports", { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => { setReports(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const counts = { All: reports.length, Low: 0, Medium: 0, High: 0 };
  reports.forEach(r => { try { const p = JSON.parse(r.aiResult); if (counts[p.riskLevel] !== undefined) counts[p.riskLevel]++; } catch {} });

  const filtered = reports.filter(r => {
    const matchesFilter = filter === "All" || (() => { try { return JSON.parse(r.aiResult).riskLevel === filter; } catch { return false; } })();
    const matchesSearch = search === "" || r.originalFileName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const card    = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted   = dark ? "text-slate-400" : "text-slate-500";
  const pillAct = "bg-blue-600 border-blue-600 text-white";
  const pillDef = dark ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                       : "bg-white border-slate-200 text-slate-600 hover:border-slate-300";

  return (
    <div className="max-w-3xl mx-auto" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 animate-fadeInUp">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5 text-blue-500">History</p>
          <h1 className="font-bold text-2xl" style={{ fontFamily:"'Sora',sans-serif" }}>My Reports</h1>
        </div>
        <Link to="/upload"
          className="sm:ml-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 whitespace-nowrap">
          + New Analysis
        </Link>
      </div>

      {/* Summary bar */}
      {!loading && reports.length > 0 && (
        <div className={`grid grid-cols-4 divide-x ${dark ? "divide-slate-800" : "divide-slate-100"} rounded-xl border p-0 mb-5 overflow-hidden animate-fadeInUp delay-75 ${card}`}>
          {[
            { label:"Total",  val:counts.All,    color:"text-blue-500" },
            { label:"Low",    val:counts.Low,    color:"text-emerald-500" },
            { label:"Medium", val:counts.Medium, color:"text-amber-500" },
            { label:"High",   val:counts.High,   color:"text-red-500" },
          ].map((s,i) => (
            <div key={i} className="py-3 text-center">
              <p className={`font-bold text-lg ${s.color}`} style={{ fontFamily:"'Sora',sans-serif" }}>{s.val}</p>
              <p className={`text-[0.65rem] font-medium ${muted}`}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && reports.length > 0 && (
        <div className="relative mb-4 animate-fadeInUp">
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${muted}`}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search reports by filename…"
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-blue-500/20
              ${dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400"}`}
          />
        </div>
      )}
      {/* Filter */}
      {!loading && reports.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 animate-fadeInUp delay-100">
          {["All","Low","Medium","High"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${filter === f ? pillAct : pillDef}`}>
              {f === "All" ? "All" : f} {filter === f && `(${counts[f]})`}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 rounded-xl border text-center ${card} animate-fadeInUp`}>
          <span className="text-4xl mb-3">{reports.length === 0 ? "📭" : "🔍"}</span>
          <p className={`font-semibold text-base mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>
            {reports.length === 0 ? "No reports yet" : `No ${filter} risk reports`}
          </p>
          <p className={`text-sm mb-5 ${muted}`}>{reports.length === 0 ? "Upload your first report to get started." : "Try a different filter."}</p>
          {reports.length === 0 && (
            <Link to="/upload" className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
              Upload Report →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => <ReportCard key={r._id} r={r} dark={dark} delay={i * 50} />)}
        </div>
      )}
    </div>
  );
}
