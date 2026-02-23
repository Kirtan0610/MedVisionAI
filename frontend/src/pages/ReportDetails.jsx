import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/* ── Risk Ring ── */
function RiskRing({ score = 0, riskLevel = "Low", dark }) {
  const r = 48, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = riskLevel === "High" ? "#ef4444" : riskLevel === "Medium" ? "#f59e0b" : "#10b981";
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg width="112" height="112" className="progress-ring" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke={dark ? "#1e293b" : "#f1f5f9"} strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="progress-ring__circle" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-2xl leading-none" style={{ fontFamily:"'Sora',sans-serif", color }}>{score}</span>
        <span className={`text-[0.55rem] font-semibold uppercase tracking-wider mt-0.5 ${dark ? "text-slate-400" : "text-slate-400"}`}>Risk Score</span>
      </div>
    </div>
  );
}

/* ── Findings Table Row ── */
function FindingRow({ f, dark, i }) {
  const statusCfg = {
    Normal:     { text:"text-emerald-500", badge:"text-emerald-600 bg-emerald-500/10 border-emerald-500/25" },
    Borderline: { text:"text-amber-500",   badge:"text-amber-600   bg-amber-500/10   border-amber-500/25" },
    Abnormal:   { text:"text-red-500",     badge:"text-red-500     bg-red-500/10     border-red-500/25" },
  };
  const s = statusCfg[f.status] || statusCfg.Normal;
  const w = f.status === "Normal" ? 88 : f.status === "Borderline" ? 45 : 16;
  const barColor = f.status === "Normal" ? "#10b981" : f.status === "Borderline" ? "#f59e0b" : "#ef4444";
  const row = dark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50";
  const sub  = dark ? "text-slate-500" : "text-slate-400";
  return (
    <tr className={`border-b transition-colors animate-fadeInUp ${row}`} style={{ animationDelay:`${i*50}ms` }}>
      <td className={`py-3 px-4 text-sm font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>{f.parameter}</td>
      <td className={`py-3 px-4 font-mono font-semibold text-sm ${dark ? "text-slate-200" : "text-slate-800"}`}>{f.value}</td>
      <td className={`py-3 px-4 text-xs ${sub}`}>{f.normalRange}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded text-[0.65rem] font-semibold border uppercase tracking-wide ${s.badge}`}>{f.status}</span>
      </td>
      <td className="py-3 px-4 min-w-[70px]">
        <div className={`h-1 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
          <div className="h-full rounded-full meter-fill" style={{ width:`${w}%`, background:barColor }} />
        </div>
      </td>
    </tr>
  );
}

/* ── Medicine Card ── */
function MedicineCard({ med, dark, i }) {
  const typeCfg = {
    "Supplement":            { color:"text-blue-400",   bg:"bg-blue-500/10 border-blue-500/20" },
    "OTC Medicine":          { color:"text-violet-400", bg:"bg-violet-500/10 border-violet-500/20" },
    "Prescription Required": { color:"text-orange-400", bg:"bg-orange-500/10 border-orange-500/20" },
  };
  const t = typeCfg[med.type] || typeCfg["Supplement"];
  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const warnBg = dark ? "bg-amber-500/8 border-amber-500/20 text-amber-400/80" : "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <div className={`rounded-xl border p-4 animate-fadeInUp ${card}`} style={{ animationDelay:`${i*80}ms` }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className={`font-semibold text-sm ${dark ? "text-slate-200" : "text-slate-800"}`}>{med.name}</h3>
          <span className={`inline-block mt-0.5 text-[0.6rem] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${t.color} ${t.bg}`}>{med.type}</span>
        </div>
        {med.requiresConsultation && (
          <span className="shrink-0 text-[0.6rem] font-semibold px-1.5 py-0.5 rounded border text-blue-400 bg-blue-500/10 border-blue-500/20 uppercase tracking-wide whitespace-nowrap">Doctor Required</span>
        )}
      </div>
      <div className="space-y-1.5 text-xs">
        <p className={muted}><span className="font-semibold">Why: </span>{med.reason}</p>
        {med.dosage && <p className={muted}><span className="font-semibold">Dosage: </span>{med.dosage}</p>}
        {med.caution && (
          <div className={`p-2 rounded-lg border text-xs ${warnBg}`}>⚠ {med.caution}</div>
        )}
      </div>
    </div>
  );
}

/* ── Tab Button ── */
function Tab({ label, active, onClick, dark }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200
        ${active
          ? "bg-blue-600 text-white"
          : dark ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}>
      {label}
    </button>
  );
}

/* ══ MAIN ══ */
export default function ReportDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [report, setReport] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [tab, setTab] = useState("overview");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeLang, setReanalyzeLang] = useState("en");
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await API.post(`/reports/${id}/reanalyze`, { language: reanalyzeLang },
        { headers: { Authorization: `Bearer ${user.token}` } });
      setReport(res.data);
      try { setParsed(JSON.parse(res.data.aiResult)); } catch {}
    } catch (e) { console.error(e); }
    finally { setReanalyzing(false); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await API.post(`/reports/${id}/share`, {},
        { headers: { Authorization: `Bearer ${user.token}` } });
      const link = `${window.location.origin}/shared/${res.data.shareToken}`;
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { } finally { setSharing(false); }
  };

  const handlePrint = () => window.print();

  useEffect(() => {
    if (!user?.token) return;
    API.get(`/reports/${id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => { setReport(res.data); try { setParsed(JSON.parse(res.data.aiResult)); } catch {} setLoading(false); })
      .catch(() => { setError("Could not load report."); setLoading(false); });
  }, [id, user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/reports/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      navigate("/reports");
    } catch { setDeleting(false); }
  };

  const card    = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted   = dark ? "text-slate-400" : "text-slate-500";
  const sub     = dark ? "text-slate-400" : "text-slate-500";
  const divider = dark ? "border-slate-800" : "border-slate-100";
  const tabWrap = dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200";
  const thBg    = dark ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-400";
  const hdrTxt  = dark ? "text-slate-200" : "text-slate-800";
  const btnDef  = dark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "border-slate-200 text-slate-600 hover:bg-slate-50";

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-3">
      {[150,90,110].map((h,i) => <div key={i} className="skeleton rounded-xl" style={{ height:h }} />)}
    </div>
  );
  if (error) return (
    <div className="max-w-4xl mx-auto text-center py-20">
      <p className="text-red-400 font-semibold mb-4">{error}</p>
      <Link to="/reports" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">← Back</Link>
    </div>
  );

  const rColor   = parsed?.riskLevel === "High" ? "#ef4444" : parsed?.riskLevel === "Medium" ? "#f59e0b" : "#10b981";
  const abnormals = parsed?.keyFindings?.filter(f => f.status !== "Normal") || [];
  const medicines = parsed?.recommendedMedicines || [];

  const TABS = [
    { key:"overview",  label:"Overview" },
    { key:"summary",   label:"Summary" },
    { key:"findings",  label:"Lab Values" },
    { key:"advice",    label:"Doctor Advice" },
    { key:"medicines", label:`Medicines${medicines.length ? ` (${medicines.length})` : ""}` },
  ];

  return (
    <div className="max-w-4xl mx-auto" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Back, Actions, Delete */}
      <div className="flex flex-wrap items-center gap-2 mb-5 animate-fadeInDown">
        <Link to="/reports"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${btnDef}`}>
          ← Back
        </Link>

        <div className="flex flex-wrap gap-2 ml-auto">
          {/* Language + Re-analyze */}
          <div className={`flex rounded-lg border overflow-hidden text-[0.65rem] font-bold ${dark ? "border-slate-700" : "border-slate-200"}`}>
            {[["en","EN"],["hi","हिं"]].map(([v,l]) => (
              <button key={v} onClick={() => setReanalyzeLang(v)}
                className={`px-2.5 py-2 transition-all ${reanalyzeLang===v ? "bg-blue-600 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={handleReanalyze} disabled={reanalyzing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${btnDef} disabled:opacity-40`}>
            {reanalyzing ? <><span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full spinner" />Analyzing…</> : "⟳ Re-analyze"}
          </button>

          {/* Share */}
          <button onClick={handleShare} disabled={sharing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${btnDef} disabled:opacity-40`}>
            {sharing ? "Sharing…" : copied ? "✓ Copied!" : "↗ Share"}
          </button>

          {/* PDF Export */}
          <button onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${btnDef}`}>
            ⬇ Export PDF
          </button>

          {/* Delete */}
          <button onClick={() => setShowDelete(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all duration-200
              ${dark ? "border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15" : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}>
            Delete
          </button>
        </div>
      </div>
      {/* Share link banner */}
      {shareLink && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border mb-3 text-xs animate-slideInLeft ${dark ? "bg-emerald-500/8 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
          <span className="text-emerald-400 font-bold shrink-0">✓</span>
          <span className={`truncate flex-1 font-mono ${dark ? "text-slate-400" : "text-slate-500"}`}>{shareLink}</span>
          <span className={`shrink-0 font-semibold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{copied ? "Copied!" : ""}</span>
        </div>
      )}

      {/* Hero */}
      <div className={`rounded-xl border p-5 sm:p-7 mb-4 animate-fadeInUp ${card}`}>
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {parsed && <RiskRing score={parsed.riskScore || 0} riskLevel={parsed.riskLevel} dark={dark} />}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              {parsed?.riskLevel && (
                <span className="text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border"
                  style={{ color:rColor, background:`${rColor}15`, borderColor:`${rColor}35` }}>
                  {parsed.riskLevel} Risk
                </span>
              )}
              {parsed?.overallHealth && (
                <span className={`text-[0.65rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border
                  ${parsed.overallHealth === "Good" ? dark ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : "text-emerald-600 bg-emerald-50 border-emerald-200"
                    : parsed.overallHealth === "Fair" ? dark ? "text-amber-400 bg-amber-500/10 border-amber-500/25" : "text-amber-600 bg-amber-50 border-amber-200"
                    : dark ? "text-red-400 bg-red-500/10 border-red-500/25" : "text-red-600 bg-red-50 border-red-200"}`}>
                  {parsed.overallHealth}
                </span>
              )}
            </div>
            <h1 className={`font-bold text-lg sm:text-xl leading-snug mb-1 break-words ${hdrTxt}`} style={{ fontFamily:"'Sora',sans-serif" }}>
              {report?.originalFileName}
            </h1>
            <p className={`text-xs ${muted}`}>
              {new Date(report?.createdAt).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </p>
          </div>
          {parsed?.doctorAdvice?.urgency && (
            <div className={`shrink-0 px-4 py-3 rounded-xl border text-center min-w-[110px]
              ${parsed.doctorAdvice.urgency.toLowerCase().includes("today")
                ? dark ? "border-red-500/25 bg-red-500/8" : "border-red-200 bg-red-50"
                : dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
              <p className="text-lg mb-0.5">{parsed.doctorAdvice.urgency.toLowerCase().includes("today") ? "🚨" : parsed.doctorAdvice.urgency.toLowerCase().includes("week") ? "⏰" : "✅"}</p>
              <p className="text-[0.65rem] font-semibold" style={{ color:rColor }}>{parsed.doctorAdvice.urgency}</p>
            </div>
          )}
        </div>
      </div>

      {/* Doctor note */}
      {parsed?.patientSummary && (
        <div className={`rounded-xl border p-4 sm:p-5 mb-4 animate-fadeInUp delay-75
          ${dark ? "bg-blue-600/5 border-blue-500/15" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm shrink-0">M</div>
            <div>
              <p className="text-blue-500 text-[0.65rem] font-bold uppercase tracking-wide mb-1">Dr. MedVision —</p>
              <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>{parsed.patientSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {parsed && (
        <div className={`p-1 rounded-xl border mb-4 animate-fadeInUp delay-100 ${tabWrap}`}>
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => <Tab key={t.key} label={t.label} active={tab===t.key} onClick={() => setTab(t.key)} dark={dark} />)}
          </div>
        </div>
      )}

      {/* ═══ TAB: Overview ═══ */}
      {(!parsed || tab === "overview") && (
        <div className="space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parsed?.goodNews && (
              <div className={`rounded-xl border-l-4 border-emerald-500 p-4 ${card}`}>
                <p className="text-emerald-500 text-xs font-semibold mb-1.5">✓ Good News</p>
                <p className={`text-sm leading-relaxed ${muted}`}>{parsed.goodNews}</p>
              </div>
            )}
            {parsed?.watchOut && (
              <div className={`rounded-xl border-l-4 border-amber-500 p-4 ${card}`}>
                <p className="text-amber-500 text-xs font-semibold mb-1.5">⚠ Watch Out</p>
                <p className={`text-sm leading-relaxed ${muted}`}>{parsed.watchOut}</p>
              </div>
            )}
          </div>
          {abnormals.length > 0 && (
            <div className={`rounded-xl border p-4 ${dark ? "bg-red-500/5 border-red-500/15" : "bg-red-50 border-red-200"}`}>
              <p className="text-red-500 text-xs font-semibold mb-3">⬤ Abnormal Values</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {abnormals.map((f,i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${dark ? "bg-red-500/8" : "bg-red-100"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.status === "Abnormal" ? "bg-red-500" : "bg-amber-500"}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${dark ? "text-slate-300" : "text-slate-700"}`}>{f.parameter}</p>
                      <p className={`text-[0.65rem] font-mono ${muted}`}>{f.value} · Normal: {f.normalRange}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {parsed?.doctorAdvice?.followUp && (
            <div className={`rounded-xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <p className={`text-blue-500 text-xs font-semibold mb-1.5`}>📅 Recommended Follow-Up</p>
              <p className={`text-sm leading-relaxed ${muted}`}>{parsed.doctorAdvice.followUp}</p>
            </div>
          )}
          {!parsed && report?.aiResult && (
            <div className={`rounded-xl border p-5 ${card}`}>
              <p className={`text-sm font-semibold mb-3 ${hdrTxt}`}>AI Analysis</p>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${muted}`}>{report.aiResult.replace(/\*\*/g,"")}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Summary ═══ */}
      {tab === "summary" && parsed && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`rounded-xl border p-5 ${card}`}>
            <h2 className={`font-semibold text-base mb-4 ${hdrTxt}`} style={{ fontFamily:"'Sora',sans-serif" }}>Report Summary</h2>
            {/* Risk meter */}
            <div className={`rounded-lg p-4 mb-4 border ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${muted}`}>Risk Level</span>
                <span className="text-sm font-bold" style={{ color:rColor }}>{parsed.riskLevel} ({parsed.riskScore}/100)</span>
              </div>
              <div className={`h-2 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
                <div className="h-full rounded-full meter-fill" style={{ width:`${parsed.riskScore}%`, background:rColor }} />
              </div>
            </div>
            {/* Summary stats */}
            <div className={`grid grid-cols-3 divide-x ${dark ? "divide-slate-700" : "divide-slate-200"} rounded-lg border overflow-hidden mb-5 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              {[
                { l:"Health",    v: parsed.overallHealth || "–" },
                { l:"Risk",      v: parsed.riskLevel || "–" },
                { l:"Score",     v: `${parsed.riskScore}/100` },
              ].map((s,i) => (
                <div key={i} className="py-3 text-center">
                  <p className="font-bold text-sm" style={{ color:rColor, fontFamily:"'Sora',sans-serif"}}>{s.v}</p>
                  <p className={`text-[0.65rem] font-medium ${muted}`}>{s.l}</p>
                </div>
              ))}
            </div>
            {/* Abnormals */}
            {abnormals.length > 0 && (
              <>
                <p className="text-xs font-semibold text-red-400 mb-2">🔴 Abnormal Values</p>
                <div className="space-y-2 mb-5">
                  {abnormals.map((f,i) => (
                    <div key={i} className={`flex flex-col sm:flex-row gap-2 sm:items-center p-3 rounded-lg border
                      ${f.status === "Abnormal" ? dark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                        : dark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"}`}>
                      <div className="flex items-center gap-2 sm:w-52 shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.status === "Abnormal" ? "bg-red-500" : "bg-amber-500"}`} />
                        <span className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>{f.parameter}</span>
                        <span className={`font-mono text-sm font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>— {f.value}</span>
                      </div>
                      {f.doctorNote && <p className={`text-xs leading-relaxed ${muted}`}>{f.doctorNote}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Lifestyle */}
            {parsed.doctorAdvice?.lifestyle?.length > 0 && (
              <>
                <p className={`text-xs font-semibold text-blue-400 mb-2`}>🏃 Lifestyle Suggestions</p>
                <ul className="space-y-1.5">
                  {parsed.doctorAdvice.lifestyle.map((item,i) => (
                    <li key={i} className={`flex gap-2.5 items-start text-sm animate-slideInLeft`} style={{ animationDelay:`${i*35}ms` }}>
                      <span className="text-blue-500 font-bold shrink-0">→</span>
                      <span className={muted}>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ TAB: Lab Values ═══ */}
      {tab === "findings" && parsed?.keyFindings?.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`rounded-xl border overflow-hidden ${card}`}>
            <div className={`px-5 py-3.5 border-b ${divider}`}>
              <h2 className={`font-semibold text-sm ${hdrTxt}`} style={{ fontFamily:"'Sora',sans-serif" }}>All Lab Parameters</h2>
              <p className={`text-xs mt-0.5 ${muted}`}>{parsed.keyFindings.length} values analyzed</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-[0.6rem] font-bold uppercase tracking-wider ${thBg}`}>
                    {["Parameter","Your Value","Normal Range","Status","Level"].map(h => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.keyFindings.map((f,i) => <FindingRow key={i} f={f} dark={dark} i={i} />)}
                </tbody>
              </table>
            </div>
          </div>
          {/* Doctor notes */}
          <div>
            <h2 className={`font-semibold text-sm mb-3 ${hdrTxt}`} style={{ fontFamily:"'Sora',sans-serif" }}>Doctor's Notes</h2>
            <div className="space-y-2.5">
              {parsed.keyFindings.filter(f => f.doctorNote).map((f,i) => (
                <div key={i} className={`flex gap-3 p-3.5 rounded-xl border animate-fadeInUp
                  ${f.status === "Abnormal" ? dark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                    : f.status === "Borderline" ? dark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"
                    : dark ? "border-emerald-500/15 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}
                  style={{ animationDelay:`${i*50}ms` }}>
                  <div className={`w-1.5 h-full rounded-full shrink-0 mt-1 ${f.status === "Abnormal" ? "bg-red-500" : f.status === "Borderline" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <div>
                    <p className={`font-semibold text-sm mb-0.5 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      {f.parameter} — <span className="font-mono">{f.value}</span>
                    </p>
                    <p className={`text-xs leading-relaxed ${muted}`}>{f.doctorNote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Advice ═══ */}
      {tab === "advice" && parsed?.doctorAdvice && (
        <div className="space-y-3 animate-fadeIn">
          {[
            { title:"Diet Recommendations", items: parsed.doctorAdvice.diet, color:"emerald", icon:"🥗" },
            { title:"Lifestyle Suggestions", items: parsed.doctorAdvice.lifestyle, color:"blue", icon:"🏃" },
          ].map((section, si) => section.items?.length > 0 && (
            <div key={si} className={`rounded-xl border p-4 sm:p-5 animate-fadeInUp ${card}`} style={{ animationDelay:`${si*80}ms` }}>
              <h3 className={`font-semibold text-sm mb-3 ${hdrTxt}`}>{section.icon} {section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item,i) => (
                  <li key={i} className={`flex gap-2.5 text-sm animate-slideInLeft`} style={{ animationDelay:`${i*40}ms` }}>
                    <span className={`font-bold shrink-0 text-${section.color}-500`}>→</span>
                    <span className={muted}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {parsed.doctorAdvice.followUp && (
            <div className={`rounded-xl border p-4 animate-fadeInUp delay-200 ${dark ? "bg-blue-600/5 border-blue-500/15" : "bg-blue-50 border-blue-200"}`}>
              <p className="text-blue-500 text-xs font-semibold mb-1.5">📅 Follow-Up Recommendation</p>
              <p className={`text-sm leading-relaxed ${muted}`}>{parsed.doctorAdvice.followUp}</p>
            </div>
          )}
          {parsed.doctorAdvice.urgency && (
            <div className={`rounded-xl border p-4 text-center animate-scaleIn
              ${parsed.doctorAdvice.urgency.toLowerCase().includes("today")
                ? dark ? "border-red-500/25 bg-red-500/8" : "border-red-200 bg-red-50"
                : dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
              <p className="text-2xl mb-1">{parsed.doctorAdvice.urgency.toLowerCase().includes("today") ? "🚨" : "✅"}</p>
              <p className={`text-xs font-medium ${muted} mb-0.5`}>Dr. MedVision recommends</p>
              <p className="font-bold text-sm" style={{ color:rColor }}>{parsed.doctorAdvice.urgency}</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Medicines ═══ */}
      {tab === "medicines" && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`flex gap-3 p-4 rounded-xl border
            ${dark ? "bg-amber-500/8 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
            <span className={`text-sm shrink-0 mt-0.5 ${dark ? "text-amber-400" : "text-amber-600"}`}>⚠</span>
            <p className={`text-xs leading-relaxed ${dark ? "text-amber-400/80" : "text-amber-700"}`}>
              <strong>Important:</strong> These suggestions are for awareness only.
              Always consult your doctor before starting any medication. Do not self-medicate.
            </p>
          </div>
          {medicines.length === 0 ? (
            <div className={`text-center py-14 rounded-xl border ${card}`}>
              <p className="text-3xl mb-2">💊</p>
              <p className={`font-semibold text-sm mb-1 ${hdrTxt}`}>No medicines in this report</p>
              <p className={`text-xs ${muted}`}>Upload a new report to receive medicine suggestions.</p>
            </div>
          ) : (
            <>
              <p className={`text-xs ${muted}`}>{medicines.length} suggestion{medicines.length > 1 ? "s" : ""} based on your lab findings:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicines.map((med,i) => <MedicineCard key={i} med={med} dark={dark} i={i} />)}
              </div>
              <div className={`flex gap-2.5 p-3.5 rounded-xl border
                ${dark ? "bg-blue-600/5 border-blue-500/15" : "bg-blue-50 border-blue-200"}`}>
                <span className={`text-sm shrink-0 ${dark ? "text-blue-400" : "text-blue-500"}`}>ℹ</span>
                <p className={`text-xs leading-relaxed ${dark ? "text-blue-400/70" : "text-blue-700"}`}>
                  Take this list to your doctor. They can confirm which ones are right for you and adjust dosage as needed.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowDelete(false)}>
          <div className={`w-full max-w-xs rounded-2xl border p-6 animate-scaleIn ${card}`} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <p className="text-3xl mb-3">🗑</p>
              <h2 className={`font-bold text-base mb-1 ${hdrTxt}`} style={{ fontFamily:"'Sora',sans-serif" }}>Delete Report?</h2>
              <p className={`text-xs leading-relaxed ${muted}`}>This cannot be undone. All analysis will be permanently removed.</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDelete(false)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border transition-all duration-200
                  ${dark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50">
                {deleting ? <><span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full spinner" />Deleting…</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
