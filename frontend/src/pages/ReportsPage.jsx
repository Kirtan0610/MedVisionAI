import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";


/* ── Risk Badge ── */
function RiskBadge({ level }) {
  const cfg = {
    Low:    { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
    Medium: { cls: "text-amber-400   bg-amber-500/10   border-amber-500/30",   dot: "bg-amber-400" },
    High:   { cls: "text-red-400     bg-red-500/10     border-red-500/30",     dot: "bg-red-400" },
  };
  const c = cfg[level] || { cls: "text-slate-400 bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border uppercase tracking-wider ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level || "Unknown"}
    </span>
  );
}

/* ── Health Pill ── */
function HealthPill({ health, dark }) {
  if (!health) return null;
  const cfg = {
    Good:   { icon: "◉", color: "text-emerald-400", bg: dark ? "bg-emerald-500/10" : "bg-emerald-50" },
    Fair:   { icon: "◉", color: "text-amber-400",   bg: dark ? "bg-amber-500/10"   : "bg-amber-50" },
    Poor:   { icon: "◉", color: "text-red-400",     bg: dark ? "bg-red-500/10"     : "bg-red-50" },
  };
  const c = cfg[health] || cfg.Fair;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.color} ${c.bg}`}>
      {c.icon} {health}
    </span>
  );
}

/* ── Report Card ── */
function ReportCard({ r, dark, delay, onDelete, hi }) {
  let parsed = null;
  try { parsed = JSON.parse(r.aiResult); } catch {}
  const risk      = parsed?.riskLevel;
  const health    = parsed?.overallHealth;
  const summary   = parsed?.patientSummary || r.aiResult?.replace(/\*\*/g, "").slice(0, 160);
  const urgency   = parsed?.doctorAdvice?.urgency;
  const medCount  = parsed?.recommendedMedicines?.length || 0;
  const score     = parsed?.riskScore || 0;
  const abnCount  = parsed?.keyFindings?.filter(f => f.status !== "Normal")?.length || 0;

  const rColor = risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#10b981";

  const urgencyUrgent = urgency?.toLowerCase().includes("today") || urgency?.toLowerCase().includes("immediately");

  return (
    <div className="relative group animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <Link
        to={`/report/${r._id}`}
        className="block"
      >
        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300
          group-hover:-translate-y-1 group-hover:shadow-xl cursor-pointer
          ${dark
            ? "bg-slate-900 border-slate-800 group-hover:border-slate-600 group-hover:shadow-blue-900/30"
            : "bg-white border-slate-200 group-hover:border-blue-200 group-hover:shadow-slate-200/80"
          }`}
        >
          {/* Top accent bar */}
          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${rColor}80, transparent)` }} />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 shadow-sm
                ${dark ? "bg-slate-800" : "bg-slate-100"}`}
              >
                📄
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 justify-between flex-wrap mb-1">
                  <p className={`text-sm font-bold truncate max-w-[180px] leading-tight
                    ${dark ? "text-slate-100" : "text-slate-800"}`}
                  >
                    {r.originalFileName}
                  </p>
                  <RiskBadge level={risk} />
                </div>
                <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                  {" · "}
                  {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <HealthPill health={health} dark={dark} />
              {score > 0 && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                  ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                >
                  <span className="font-bold" style={{ color: rColor }}>{score}</span>
                  <span>/100 risk</span>
                </span>
              )}
              {medCount > 0 && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                  ${dark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}
                >
                  💊 {medCount} med{medCount > 1 ? "s" : ""}
                </span>
              )}
              {abnCount > 0 && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium
                  ${dark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}
                >
                  ⚠ {abnCount} abnormal
                </span>
              )}
            </div>

            {/* Risk Score Bar */}
            {score > 0 && (
              <div className={`h-1 rounded-full mb-4 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                <div
                  className="h-full rounded-full transition-all duration-700 meter-fill"
                  style={{ width: `${score}%`, background: `linear-gradient(90deg, ${rColor}80, ${rColor})` }}
                />
              </div>
            )}

            {/* Summary */}
            <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {summary || "No summary available."}
            </p>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-3 border-t
              ${dark ? "border-slate-800" : "border-slate-100"}`}
            >
              {urgencyUrgent ? (
                <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  🚨 {urgency}
                </span>
              ) : urgency ? (
                <span className={`text-[0.6rem] font-semibold ${dark ? "text-slate-500" : "text-slate-400"}`}>
                  {urgency}
                </span>
              ) : <span />}
              <span className={`flex items-center gap-1 text-xs font-semibold transition-all duration-200
                group-hover:gap-2 text-blue-500 mr-2`}
              >
                {hi ? "विवरण देखें" : "View details"}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </span>

            </div>
          </div>
        </div>
      </Link>
      
      {/* Delete Button - Absolute positioned in card but not inside Link to avoid bubbing */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(r._id);
        }}
        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center 
          opacity-0 group-hover:opacity-100 transition-all duration-200 z-10
          ${dark ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" : "bg-red-50 hover:bg-red-100 text-red-500"}`}
        title="Delete report"
      >
        <span className="text-sm">🗑</span>
      </button>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, val, color, icon, dark }) {
  return (
    <div className={`flex flex-col items-center justify-center py-4 gap-1 relative overflow-hidden
      ${dark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"} transition-colors duration-200 rounded-xl`}
    >
      <span className="text-xl mb-0.5">{icon}</span>
      <p className={`font-black text-xl leading-none ${color}`} style={{ fontFamily: "'Sora',sans-serif" }}>{val}</p>
      <p className={`text-[0.65rem] font-semibold uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
    </div>
  );
}

/* ══ MAIN ══ */
export default function ReportsPage() {
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const { lang } = useLanguage();
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");
  const [sortBy, setSortBy]     = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [deletingId, setDeletingId] = useState(null);

  const hi = lang === "hi";

  const t = {
    title: hi ? "मेरी रिपोर्ट्स" : "My Reports",
    newAnalysis: hi ? "+ नई जांच" : "+ New Analysis",
    all: hi ? "सभी" : "All",
    low: hi ? "कम जोखिम" : "Low Risk",
    medium: hi ? "मध्यम" : "Medium",
    high: hi ? "उच्च जोखिम" : "High Risk",
    total: hi ? "कुल" : "Total",
    search: hi ? "फ़ाइल नाम से खोजें..." : "Search by filename...",
    newest: hi ? "नया पहले" : "Newest First",
    oldest: hi ? "पुराना पहले" : "Oldest First",
    risk: hi ? "उच्च जोखिम" : "Highest Risk",
    noReports: hi ? "कोई रिपोर्ट नहीं मिली" : "No reports yet",
    uploadFirst: hi ? "पहली रिपोर्ट अपलोड करें →" : "Upload First Report →",
    deleteConfirm: hi ? "क्या आप वाकई इस रिपोर्ट को हटाना चाहते हैं?" : "Are you sure you want to delete this report?",
    showing: hi ? "दिखा रहा है" : "Showing",
    of: hi ? "में से" : "of",
    reports: hi ? "रिपोर्ट्स" : "reports",
    viewDetails: hi ? "विवरण देखें" : "View details",
    delete: hi ? "हटाएं" : "Delete",
    lastUpdated: hi ? "पिछला अपडेट" : "Last updated",
    abnormal: hi ? "असामान्य" : "abnormal",
    riskLbl: hi ? "जोखिम" : "risk",
  };


  useEffect(() => {
    if (user?.token) {
      API.get("/reports", { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => { setReports(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setDeletingId(id);
    try {
      await API.delete(`/reports/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      alert("Error deleting report");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, sortBy]);

  const counts = { All: reports.length, Low: 0, Medium: 0, High: 0 };
  reports.forEach(r => {
    try { const p = JSON.parse(r.aiResult); if (counts[p.riskLevel] !== undefined) counts[p.riskLevel]++; } catch {}
  });

  const filtered = reports
    .filter(r => {
      const matchesFilter = filter === "All" || (() => {
        try { return JSON.parse(r.aiResult).riskLevel === filter; } catch { return false; }
      })();
      const matchesSearch = search === "" || r.originalFileName.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "risk") {
        const order = { High: 3, Medium: 2, Low: 1 };
        const ra = (() => { try { return JSON.parse(a.aiResult).riskLevel; } catch { return "Low"; } })();
        const rb = (() => { try { return JSON.parse(b.aiResult).riskLevel; } catch { return "Low"; } })();
        return (order[rb] || 0) - (order[ra] || 0);
      }
      return 0;
    });

  const pillAct = "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20";
  const pillDef = dark
    ? "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800";

  const filterColors = {
    All:    pillAct,
    Low:    filter === "Low"    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20" : pillDef,
    Medium: filter === "Medium" ? "bg-amber-500   border-amber-500   text-white shadow-sm shadow-amber-500/20"   : pillDef,
    High:   filter === "High"   ? "bg-red-600     border-red-600     text-white shadow-sm shadow-red-500/20"     : pillDef,
  };

  return (
    <div className="max-w-3xl mx-auto" style={{ fontFamily: "'Inter',sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8 animate-fadeInUp">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-blue-500">{hi ? "स्वास्थ्य रिकॉर्ड" : "Health Records"}</p>
          <h1 className="font-black text-3xl leading-tight" style={{ fontFamily: "'Sora',sans-serif" }}>
            {t.title}
          </h1>
          {!loading && reports.length > 0 && (
            <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {reports.length} {t.reports} · {t.lastUpdated}{" "}
              {new Date(Math.max(...reports.map(r => new Date(r.createdAt)))).toLocaleDateString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>

        <Link
          to="/upload"
          className="sm:ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white
            bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600
            transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
            hover:-translate-y-0.5 whitespace-nowrap"
        >
          {t.newAnalysis}
        </Link>

      </div>

      {/* ── Summary Stats ── */}
      {!loading && reports.length > 0 && (
        <div className={`grid grid-cols-4 rounded-2xl border mb-6 overflow-hidden animate-fadeInUp
          ${dark ? "bg-slate-900 border-slate-800 divide-x divide-slate-800" : "bg-white border-slate-200 divide-x divide-slate-100"}`}
        >
          <StatCard label={t.total} val={counts.All} color="text-blue-500" icon="📊" dark={dark} />
          <StatCard label={t.low} val={counts.Low} color="text-emerald-500" icon="✅" dark={dark} />
          <StatCard label={t.medium} val={counts.Medium} color="text-amber-500" icon="⚠️" dark={dark} />
          <StatCard label={t.high} val={counts.High} color="text-red-500" icon="🚨" dark={dark} />
        </div>

      )}

      {/* ── Search + Sort ── */}
      {!loading && reports.length > 0 && (
        <div className="flex gap-2 mb-4 animate-fadeInUp">
          <div className="relative flex-1">
            <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                ${dark
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
            />

          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer
              transition-all duration-200 focus:ring-2 focus:ring-blue-500/20
              ${dark
                ? "bg-slate-800 border-slate-700 text-slate-300"
                : "bg-white border-slate-200 text-slate-600"
              }`}
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
            <option value="risk">{t.risk}</option>
          </select>

        </div>
      )}

      {/* ── Filter Pills ── */}
      {!loading && reports.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fadeInUp">
          {[
            { key: "All",    label: t.all, count: counts.All },
            { key: "Low",    label: t.low,    count: counts.Low },
            { key: "Medium", label: t.medium, count: counts.Medium },
            { key: "High",   label: t.high,   count: counts.High },
          ].map(f => (

            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200
                ${filter === f.key ? filterColors[f.key] : pillDef}`}
            >
              {f.label}
              <span className={`text-[0.6rem] font-black px-1.5 py-0.5 rounded-full
                ${filter === f.key ? "bg-white/20" : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`skeleton h-44 rounded-2xl ${dark ? "bg-slate-800" : "bg-slate-100"}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border text-center animate-fadeInUp
          ${dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}
        >
          <span className="text-5xl mb-4">{reports.length === 0 ? "📭" : "🔍"}</span>
          <p className={`font-bold text-lg mb-2 ${dark ? "text-slate-200" : "text-slate-700"}`}>
            {reports.length === 0 ? t.noReports : `${hi ? "कोई " : "No "}${filter === "All" ? "" : (hi ? t[filter.toLowerCase()] : filter) + " "} ${hi ? "रिपोर्ट नहीं मिली" : "reports found"}`}
          </p>
          <p className={`text-sm mb-6 max-w-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {reports.length === 0
              ? (hi ? "AI-आधारित स्वास्थ्य विश्लेषण प्राप्त करने के लिए अपनी पहली मेडिकल रिपोर्ट अपलोड करें।" : "Upload your first medical report to get an AI-powered health analysis.")
              : (hi ? "कृपया अपनी खोज बदलें।" : "Try adjusting your filter or search term.")}
          </p>

          {reports.length === 0 && (
            <Link
              to="/upload"
              className="px-8 py-3 rounded-xl text-sm font-bold text-white
                bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600
                transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {t.uploadFirst}
            </Link>

          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((r, i) => (
              <ReportCard 
                key={r._id} 
                r={r} 
                dark={dark} 
                delay={i * 60} 
                onDelete={handleDelete}
                hi={hi}
              />
            ))}
          
          <div className={`flex flex-col items-center gap-4 pt-6 pb-2 border-t mt-8 ${dark ? "border-slate-800" : "border-slate-100"}`}>
            {/* Pagination Controls */}
            {filtered.length > itemsPerPage && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200
                    ${currentPage === 1 
                      ? "opacity-30 cursor-not-allowed" 
                      : dark 
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                >
                  ←
                </button>
                
                {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-all duration-200
                      ${currentPage === i + 1
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25"
                        : dark
                          ? "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
                          : "border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200
                    ${currentPage === Math.ceil(filtered.length / itemsPerPage)
                      ? "opacity-30 cursor-not-allowed"
                      : dark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                >
                  →
                </button>
              </div>
            )}

            <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${dark ? "text-slate-600" : "text-slate-400"}`}>
               {t.showing} {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filtered.length, currentPage * itemsPerPage)} {t.of} {filtered.length} {t.reports}
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
