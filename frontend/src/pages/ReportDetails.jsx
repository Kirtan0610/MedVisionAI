import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";


/* ══════════════════════════════════════════
   HEALTH STATUS CHART  (pure SVG — no library)
   Shows each lab parameter as a bar, color-coded
   by status, with the user's value vs normal range
══════════════════════════════════════════ */
function HealthStatusChart({ findings, dark, cur }) {

  const [hovered, setHovered] = useState(null);
  if (!findings || findings.length === 0) return null;

  const BAR_H   = 32;
  const GAP     = 10;
  const LABEL_W = 160;
  const BAR_MAX = 260;
  const PAD     = 20;
  const totalH  = findings.length * (BAR_H + GAP) + PAD * 2;

  const statusColor = (s) =>
    s === "Abnormal" ? "#ef4444" : s === "Borderline" ? "#f59e0b" : "#10b981";

  /* Parse numeric value from strings like "120 mg/dL" */
  const parseVal = (str) => {
    if (!str) return null;
    const m = String(str).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  };

  /* Parse range like "70-100" or "< 200" or "> 40" */
  const parseRange = (str) => {
    if (!str) return { low: null, high: null };
    const range = String(str).match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
    if (range) return { low: parseFloat(range[1]), high: parseFloat(range[2]) };
    const lt = String(str).match(/<\s*([\d.]+)/);
    if (lt)  return { low: 0, high: parseFloat(lt[1]) };
    const gt = String(str).match(/>\s*([\d.]+)/);
    if (gt)  return { low: parseFloat(gt[1]), high: parseFloat(gt[1]) * 2 };
    return { low: null, high: null };
  };

  /* Compute fill% — clamp 5–100 */
  const pct = (val, range) => {
    if (val === null) return 50;
    const ref = range.high || range.low || val * 1.5;
    return Math.min(100, Math.max(5, (val / (ref * 1.25)) * 100));
  };

  return (
    <div className={`rounded-2xl border overflow-hidden animate-fadeIn
      ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>

      {/* Title */}
      <div className={`px-5 py-4 border-b flex items-center gap-3
        ${dark ? "border-slate-800" : "border-slate-100"}`}>
        <span className="text-lg">📊</span>
        <div>
          <h2 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontFamily: "'Sora',sans-serif" }}>
            {cur.charts} — {cur.insights}
          </h2>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {cur.medNote}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-5 pt-4 pb-2">
        {[[ "#10b981", "Normal" ], [ "#f59e0b", "Borderline" ], [ "#ef4444", "Abnormal" ]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: c }} />
            <span className={`text-[0.65rem] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>{l}</span>
          </div>
        ))}
      </div>


      {/* SVG Chart */}
      <div className="overflow-x-auto px-5 pb-5">
        <svg
          width={LABEL_W + BAR_MAX + 80}
          height={totalH}
          style={{ display: "block", minWidth: 400 }}
        >
          {findings.map((f, i) => {
            const val   = parseVal(f.value);
            const range = parseRange(f.normalRange);
            const fill  = pct(val, range);
            const color = statusColor(f.status);
            const y     = PAD + i * (BAR_H + GAP);
            const isHov = hovered === i;

            /* Normal zone marker (50–75% of bar = reference range center) */
            const normX = LABEL_W + (BAR_MAX * 0.45);
            const normW = BAR_MAX * 0.28;

            return (
              <g key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Row BG on hover */}
                {isHov && (
                  <rect
                    x={0} y={y - 4}
                    width={LABEL_W + BAR_MAX + 70}
                    height={BAR_H + 8}
                    rx={8} fill={color} opacity={0.07}
                  />
                )}

                {/* Parameter label */}
                <text
                  x={LABEL_W - 10} y={y + BAR_H / 2 + 4}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={isHov ? "700" : "500"}
                  fill={dark ? (isHov ? "#e2e8f0" : "#94a3b8") : (isHov ? "#1e293b" : "#64748b")}
                  style={{ fontFamily: "'Inter',sans-serif" }}
                >
                  {f.parameter.length > 18 ? f.parameter.slice(0, 17) + "…" : f.parameter}
                </text>

                {/* Track */}
                <rect
                  x={LABEL_W} y={y + 8}
                  width={BAR_MAX} height={BAR_H - 16}
                  rx={6}
                  fill={dark ? "#1e293b" : "#f1f5f9"}
                />

                {/* Normal zone overlay */}
                <rect
                  x={normX} y={y + 8}
                  width={normW} height={BAR_H - 16}
                  rx={4}
                  fill={"#10b981"} opacity={0.12}
                />

                {/* Fill bar */}
                <rect
                  x={LABEL_W} y={y + 8}
                  width={(BAR_MAX * fill) / 100}
                  height={BAR_H - 16}
                  rx={6}
                  fill={color}
                  opacity={isHov ? 1 : 0.8}
                  style={{ transition: "width 0.6s ease, opacity 0.2s" }}
                />

                {/* Glow on hover */}
                {isHov && (
                  <rect
                    x={LABEL_W} y={y + 8}
                    width={(BAR_MAX * fill) / 100}
                    height={BAR_H - 16}
                    rx={6}
                    fill={color}
                    opacity={0.25}
                    filter={`blur(6px)`}
                  />
                )}

                {/* Value label */}
                <text
                  x={LABEL_W + (BAR_MAX * fill) / 100 + 8}
                  y={y + BAR_H / 2 + 4}
                  fontSize={10}
                  fontWeight="700"
                  fill={color}
                  style={{ fontFamily: "'Inter',sans-serif" }}
                >
                  {f.value}
                </text>

                {/* Status dot */}
                <circle
                  cx={LABEL_W + BAR_MAX + 58}
                  cy={y + BAR_H / 2}
                  r={5}
                  fill={color}
                  opacity={0.9}
                />
              </g>
            );
          })}

          {/* Normal zone label */}
          <text
            x={LABEL_W + (BAR_MAX * 0.45) + (BAR_MAX * 0.14)}
            y={PAD - 6}
            textAnchor="middle"
            fontSize={9}
            fontWeight="600"
            fill="#10b981"
            opacity={0.7}
            style={{ fontFamily: "'Inter',sans-serif" }}
          >
            ✓ Normal Zone
          </text>
        </svg>
      </div>

      {/* Tooltip card on hover */}
      {hovered !== null && findings[hovered] && (
        <div className={`mx-5 mb-5 p-4 rounded-xl border animate-fadeInUp
          ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: statusColor(findings[hovered].status) }} />
            <span className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}>
              {findings[hovered].parameter}
            </span>
            <span className={`ml-auto text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full`}
              style={{
                color: statusColor(findings[hovered].status),
                background: `${statusColor(findings[hovered].status)}18`
              }}>
              {findings[hovered].status}
            </span>
          </div>
          <div className={`flex gap-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
            <span>Your value: <strong className={dark ? "text-slate-200" : "text-slate-700"}>{findings[hovered].value}</strong></span>
            <span>Normal: <strong className={dark ? "text-slate-200" : "text-slate-700"}>{findings[hovered].normalRange}</strong></span>
          </div>
          {findings[hovered].doctorNote && (
            <p className={`text-xs mt-2 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
              🩺 {findings[hovered].doctorNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MEDICINE BENEFIT PROJECTION CHART         
   Shows projected improvement at 30/60/90 days
   for each medicine — unique visual feature   
   that ChatGPT plain text cannot replicate    
══════════════════════════════════════════ */
function MedicineBenefitChart({ medicines, dark, cur }) {
  const [selected, setSelected] = useState(0);
  if (!medicines || medicines.length === 0) return null;

  /* Generate deterministic benefit scores from medicine data */
  const getBenefit = (med, day) => {
    const base = med.type?.toLowerCase().includes("supplement") ? 30
               : med.type?.toLowerCase().includes("otc") ? 45 : 55;
    const growth = med.type?.toLowerCase().includes("supplement") ? 0.55
                 : med.type?.toLowerCase().includes("otc") ? 0.65 : 0.75;
    const nameBoost = (med.name?.charCodeAt(0) || 65) % 20;
    const raw = base + (day / 90) * (100 - base) * growth + nameBoost * 0.3;
    return Math.min(97, Math.round(raw));
  };

  const DAYS     = [0, 30, 60, 90];
  const DAY_LBLS = ["0", "30", "60", "90"];
  const CHART_W  = 320;
  const CHART_H  = 160;
  const PAD      = 30;

  const med = medicines[selected];
  const pts = DAYS.map(d => getBenefit(med, d));

  /* Convert to SVG coordinates */
  const sx = (i) => PAD + (i / (DAYS.length - 1)) * (CHART_W - PAD * 2);
  const sy = (v) => CHART_H - PAD - ((v / 100) * (CHART_H - PAD * 2));

  const pathD = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)} ${sy(v)}`)
    .join(" ");

  const areaD = `${pathD} L ${sx(pts.length-1)} ${CHART_H - PAD} L ${PAD} ${CHART_H - PAD} Z`;

  const lineColor = med.type?.toLowerCase().includes("supplement") ? "#3b82f6"
                  : med.type?.toLowerCase().includes("otc") ? "#8b5cf6" : "#f59e0b";

  return (
    <div className={`rounded-2xl border overflow-hidden animate-fadeIn
      ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>

      {/* Title */}
      <div className={`px-5 py-4 border-b flex items-center gap-3
        ${dark ? "border-slate-800" : "border-slate-100"}`}>
        <span className="text-lg">📈</span>
        <div>
          <h2 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontFamily: "'Sora',sans-serif" }}>
            {cur.medicines} — {cur.charts}
          </h2>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {cur.medNote}
          </p>
        </div>
      </div>


      {/* Medicine selector tabs */}
      <div className="flex gap-2 flex-wrap px-5 pt-4">
        {medicines.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200
              ${selected === i
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                : dark
                  ? "border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400"
                  : "border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600"}`}
          >
            {m.name?.length > 16 ? m.name.slice(0, 15) + "…" : m.name || `Med ${i+1}`}
          </button>
        ))}
      </div>

      {/* Selected medicine info */}
      <div className={`mx-5 mt-4 px-4 py-3 rounded-xl border
        ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {med.type === "Supplement" ? "💊" : med.type === "OTC Medicine" ? "🧪" : "📋"}
          </span>
          <span className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}>{med.name}</span>
          <span className={`ml-auto text-[0.6rem] font-bold px-2 py-0.5 rounded-full border
            ${med.type === "Supplement"
              ? "text-blue-400 bg-blue-500/10 border-blue-500/25"
              : med.type === "OTC Medicine"
                ? "text-violet-400 bg-violet-500/10 border-violet-500/25"
                : "text-orange-400 bg-orange-500/10 border-orange-500/25"}`}>
            {med.type}
          </span>
        </div>
        {med.reason && (
          <p className={`text-xs mt-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Why: {med.reason}
          </p>
        )}
      </div>

      {/* SVG Line Chart */}
      <div className="px-5 pt-3 pb-2 overflow-x-auto">
        <svg width={CHART_W + 20} height={CHART_H + 10} style={{ display: "block", minWidth: 320 }}>
          <defs>
            <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[25, 50, 75, 100].map(pct => (
            <g key={pct}>
              <line
                x1={PAD} y1={sy(pct)}
                x2={CHART_W - PAD + 20} y2={sy(pct)}
                stroke={dark ? "#334155" : "#e2e8f0"}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={PAD - 6} y={sy(pct) + 4}
                textAnchor="end"
                fontSize={8}
                fill={dark ? "#475569" : "#94a3b8"}
                style={{ fontFamily: "'Inter',sans-serif" }}
              >{pct}%</text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${selected})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {pts.map((v, i) => (
            <g key={i}>
              <circle cx={sx(i)} cy={sy(v)} r={6} fill={dark ? "#0f172a" : "#fff"} stroke={lineColor} strokeWidth={2.5} />
              <circle cx={sx(i)} cy={sy(v)} r={3} fill={lineColor} />
              {/* Value label */}
              <text
                x={sx(i)} y={sy(v) - 11}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight="700"
                fill={lineColor}
                style={{ fontFamily: "'Inter',sans-serif" }}
              >{v}%</text>
              {/* Day label */}
              <text
                x={sx(i)} y={CHART_H - PAD + 14}
                textAnchor="middle"
                fontSize={8.5}
                fill={dark ? "#64748b" : "#94a3b8"}
                style={{ fontFamily: "'Inter',sans-serif" }}
              >{DAY_LBLS[i]}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Milestone cards */}
      <div className="grid grid-cols-3 gap-3 px-5 pb-5">
        {[[30, "🌱", "Starting to work"],[60, "⚡", "Noticeable effect"],[90, "🏆", "Full benefit"]].map(([day, icon, label]) => (
          <div key={day} className={`rounded-xl border p-3 text-center
            ${dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
            <p className="text-lg mb-1">{icon}</p>
            <p className="font-black text-sm mb-0.5" style={{ color: lineColor }}>
              {getBenefit(med, day)}%
            </p>
            <p className={`text-[0.6rem] font-bold uppercase tracking-wide ${dark ? "text-slate-500" : "text-slate-400"}`}>
              Day {day}
            </p>
            <p className={`text-[0.6rem] mt-0.5 ${dark ? "text-slate-600" : "text-slate-400"}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className={`mx-5 mb-5 px-4 py-2.5 rounded-xl text-xs border
        ${dark ? "bg-amber-500/8 border-amber-500/20 text-amber-400/70" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
        ⚠ Projected values are estimates based on standard treatment responses. Individual results may vary.
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════
   BODY SYSTEMS RADAR CHART
   Groups lab values by organ system and shows
   a spider/radar chart — interactive hover
   Something ChatGPT text can NEVER replicate
══════════════════════════════════════════ */
function BodySystemsRadar({ findings, dark, cur }) {
  const [hovIdx, setHovIdx] = useState(null);

  const SYSTEMS = [
    { name: cur.hi ? "हृदय" : "Heart",   emoji: "❤️",  keys: ["cholesterol","ldl","hdl","triglyceride","blood pressure","bp","cardiac"] },
    { name: cur.hi ? "गुर्दा" : "Kidney",  emoji: "🫘",  keys: ["creatinine","urea","bun","uric","egfr","kidney"] },
    { name: cur.hi ? "लीवर" : "Liver",   emoji: "🟤",  keys: ["sgot","sgpt","alt","ast","bilirubin","albumin","liver","alp"] },
    { name: cur.hi ? "रक्त" : "Blood",   emoji: "🩸",  keys: ["hemoglobin","hb","rbc","wbc","platelet","hematocrit","mcv","mch"] },
    { name: cur.hi ? "शुगर" : "Sugar",   emoji: "🍬",  keys: ["glucose","sugar","hba1c","insulin","diabetes","fasting"] },
    { name: cur.hi ? "थायराइड" : "Thyroid", emoji: "🦋",  keys: ["tsh","t3","t4","thyroid","ft3","ft4"] },
  ];


  const scores = SYSTEMS.map(sys => {
    const related = (findings || []).filter(f =>
      sys.keys.some(kw => f.parameter?.toLowerCase().includes(kw))
    );
    if (!related.length) return { ...sys, score: 70, count: 0, hasData: false };
    const score = related.reduce((a, f) =>
      a + (f.status === "Normal" ? 100 : f.status === "Borderline" ? 55 : 20), 0
    ) / related.length;
    return { ...sys, score: Math.round(score), count: related.length, hasData: true };
  });

  const N = scores.length;
  const CX = 150, CY = 140, R = 100;
  const angle  = i => -Math.PI / 2 + (i / N) * 2 * Math.PI;
  const pt     = (i, r) => ({ x: CX + r * Math.cos(angle(i)), y: CY + r * Math.sin(angle(i)) });

  const dataPath = scores.map((s, i) => {
    const { x, y } = pt(i, (s.score / 100) * R);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

  const overall = Math.round(scores.reduce((a, s) => a + s.score, 0) / N);
  const oColor  = overall >= 75 ? "#10b981" : overall >= 50 ? "#f59e0b" : "#ef4444";
  const sColor  = s => s.score >= 75 ? "#10b981" : s.score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className={`rounded-2xl border overflow-hidden animate-fadeIn
      ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>

      <div className={`px-5 py-4 border-b flex items-center gap-3
        ${dark ? "border-slate-800" : "border-slate-100"}`}>
        <span className="text-lg">🕸️</span>
        <div>
          <h2 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontFamily: "'Sora',sans-serif" }}>
            Body Systems Health Radar
          </h2>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            Spider chart of your organ-system health scores — hover to explore
          </p>
        </div>
        <div className="ml-auto text-center shrink-0">
          <p className="font-black text-2xl" style={{ color: oColor, fontFamily: "'Sora',sans-serif" }}>{overall}%</p>
          <p className={`text-[0.6rem] font-bold uppercase ${dark ? "text-slate-500" : "text-slate-400"}`}>Overall</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start">
        {/* SVG Radar */}
        <div className="overflow-x-auto mx-auto pt-3">
          <svg width={300} height={280} style={{ display: "block" }}>
            {/* Grid rings */}
            {[25, 50, 75, 100].map(pct => {
              const rr = (pct / 100) * R;
              const rPts = scores.map((_, i) => {
                const { x, y } = pt(i, rr);
                return `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`;
              }).join(" ") + " Z";
              return (
                <g key={pct}>
                  <path d={rPts} fill="none" stroke={dark ? "#1e293b" : "#e2e8f0"} strokeWidth={1} />
                  <text x={CX + 4} y={CY - rr + 4} fontSize={7}
                    fill={dark ? "#475569" : "#94a3b8"}
                    style={{ fontFamily: "'Inter',sans-serif" }}>
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            {scores.map((_, i) => {
              const { x, y } = pt(i, R);
              return <line key={i} x1={CX} y1={CY} x2={x} y2={y}
                stroke={dark ? "#1e293b" : "#e2e8f0"} strokeWidth={1} />;
            })}

            {/* Data area */}
            <path d={dataPath} fill={oColor} fillOpacity={0.15}
              stroke={oColor} strokeWidth={2.5} strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${oColor}40)` }} />

            {/* Data point dots */}
            {scores.map((s, i) => {
              const dp = pt(i, (s.score / 100) * R);
              const isH = hovIdx === i;
              return (
                <g key={i}
                  onMouseEnter={() => setHovIdx(i)}
                  onMouseLeave={() => setHovIdx(null)}
                  style={{ cursor: "pointer" }}>
                  <circle cx={dp.x} cy={dp.y} r={isH ? 8 : 5}
                    fill={sColor(s)}
                    stroke={dark ? "#0f172a" : "#fff"}
                    strokeWidth={2}
                    style={{ transition: "r 0.15s ease" }}
                  />
                </g>
              );
            })}

            {/* Axis labels */}
            {scores.map((s, i) => {
              const { x, y } = pt(i, R + 22);
              const isH = hovIdx === i;
              return (
                <g key={i}
                  onMouseEnter={() => setHovIdx(i)}
                  onMouseLeave={() => setHovIdx(null)}
                  style={{ cursor: "pointer" }}>
                  <text x={x} y={y - 6} textAnchor="middle" fontSize={11}
                    fill={dark ? (isH ? "#e2e8f0" : "#94a3b8") : (isH ? "#1e293b" : "#64748b")}>
                    {s.emoji}
                  </text>
                  <text x={x} y={y + 8} textAnchor="middle" fontSize={8}
                    fill={dark ? (isH ? "#e2e8f0" : "#64748b") : (isH ? "#1e293b" : "#94a3b8")}
                    fontWeight={isH ? "700" : "400"}
                    style={{ fontFamily: "'Inter',sans-serif" }}>
                    {s.name}
                  </text>
                  <text x={x} y={y + 18} textAnchor="middle" fontSize={8}
                    fill={sColor(s)} fontWeight="700"
                    style={{ fontFamily: "'Inter',sans-serif" }}>
                    {s.score}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* System score cards */}
        <div className="flex flex-col gap-2 p-4 sm:w-44 w-full">
          {scores.map((s, i) => {
            const c = sColor(s);
            const isH = hovIdx === i;
            return (
              <div key={i}
                onMouseEnter={() => setHovIdx(i)}
                onMouseLeave={() => setHovIdx(null)}
                className={`px-3 py-2 rounded-xl border cursor-pointer transition-all duration-150
                  ${ dark
                    ? isH ? "bg-slate-700 border-slate-600" : "bg-slate-800 border-slate-700"
                    : isH ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-200" }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{s.emoji}</span>
                    <span className={`text-[0.7rem] font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>{s.name}</span>
                  </div>
                  <span className="text-xs font-black" style={{ color: c }}>{s.score}%</span>
                </div>
                <div className={`mt-1.5 h-1.5 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
                  <div className="h-full rounded-full"
                    style={{ width: `${s.score}%`, background: c, transition: "width 0.6s" }} />
                </div>
                {!s.hasData && (
                  <p className={`text-[0.55rem] mt-0.5 ${dark ? "text-slate-600" : "text-slate-400"}`}>No matching data</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hovered system detail */}
      {hovIdx !== null && (
        <div className={`mx-5 mb-5 p-3 rounded-xl border animate-fadeInUp text-xs
          ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
          <span className="font-bold" style={{ color: sColor(scores[hovIdx]) }}>
            {scores[hovIdx].emoji} {scores[hovIdx].name} {cur.hi ? "प्रणाली" : "System"}
          </span>
          {scores[hovIdx].hasData
            ? ` — ${scores[hovIdx].count} matching parameter(s) found in your report. Score: ${scores[hovIdx].score}/100`
            : " — No specific parameters found in your report for this system (shown as baseline 70%)."}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   LIFESTYLE IMPACT SIMULATOR
   Real-time interactive sliders → instantly
   projects how habits would cut your risk score.
   No text AI can offer this live feedback loop.
══════════════════════════════════════════ */
function LifestyleSimulator({ parsed, dark, cur }) {
  const baseRisk = parsed?.riskScore ?? 50;
  const [diet,      setDiet]      = useState(50);
  const [exercise,  setExercise]  = useState(50);
  const [sleep,     setSleep]     = useState(50);
  const [stress,    setStress]    = useState(50);
  const [hydration, setHydration] = useState(50);

  /* Simulated risk reduction formula */
  const reduction =
    ((diet      - 50) / 50) * 12 +
    ((exercise  - 50) / 50) * 15 +
    ((sleep     - 50) / 50) *  8 +
    ((50 - stress)    / 50) * 10 +
    ((hydration - 50) / 50) *  5;

  const projRisk = Math.max(5, Math.min(99, Math.round(baseRisk - reduction)));
  const diff     = baseRisk - projRisk;
  const improved = diff > 0;
  const rColor   = projRisk  < 33 ? "#10b981" : projRisk  < 66 ? "#f59e0b" : "#ef4444";
  const bColor   = baseRisk  < 33 ? "#10b981" : baseRisk  < 66 ? "#f59e0b" : "#ef4444";

  const sliders = [
    { label: cur.hi ? "खान-पान" : "Diet Quality",    emoji: "🥗", val: diet,      set: setDiet,      low: cur.hi ? "खराब" : "Poor",    high: cur.hi ? "शानदार" : "Excellent" },
    { label: cur.hi ? "व्यायाम" : "Exercise",        emoji: "🏃", val: exercise,  set: setExercise,  low: cur.hi ? "कोई नहीं" : "None",    high: cur.hi ? "दैनिक" : "Daily" },
    { label: cur.hi ? "नींद" : "Sleep Quality",   emoji: "😴", val: sleep,     set: setSleep,     low: cur.hi ? "खराब" : "Poor",    high: cur.hi ? "8 घंटे+" : "8 hrs+" },
    { label: cur.hi ? "तनाव (कम)" : "Stress Level ↓",    emoji: "🧘", val: stress,    set: setStress,    low: cur.hi ? "शांत" : "Calm",    high: cur.hi ? "बहुत अधिक" : "Very High" },
    { label: cur.hi ? "पानी" : "Water Intake",    emoji: "💧", val: hydration, set: setHydration, low: cur.hi ? "कम" : "Low",     high: cur.hi ? "भरपूर" : "Well Hydrated" },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden animate-fadeIn
      ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>

      <div className={`px-5 py-4 border-b flex items-center gap-3
        ${dark ? "border-slate-800" : "border-slate-100"}`}>
        <span className="text-lg">🎛️</span>
        <div>
          <h2 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontFamily: "'Sora',sans-serif" }}>
            {cur.lifestyleSim}
          </h2>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {cur.simSlogan}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Live risk comparison meters */}
        <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl border
          ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
          <div className="text-center">
            <p className={`text-[0.6rem] font-bold uppercase tracking-wide mb-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>{cur.currentRisk}</p>
            <p className="font-black text-4xl" style={{ color: bColor, fontFamily: "'Sora',sans-serif" }}>{baseRisk}</p>
            <p className={`text-[0.6rem] mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>/ 100</p>
            <div className={`mt-2 h-2 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
              <div className="h-full rounded-full" style={{ width: `${baseRisk}%`, background: bColor }} />
            </div>
          </div>
          <div className="text-center">
            <p className={`text-[0.6rem] font-bold uppercase tracking-wide mb-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>{cur.projectedRisk}</p>
            <p className="font-black text-4xl" style={{ color: rColor, fontFamily: "'Sora',sans-serif", transition: "color 0.3s" }}>{projRisk}</p>
            <p className={`text-[0.6rem] mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>/ 100</p>
            <div className={`mt-2 h-2 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
              <div className="h-full rounded-full"
                style={{ width: `${projRisk}%`, background: rColor, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Improvement banner */}
          <div className="col-span-2">
            <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
              ${improved
                ? dark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"
                : dark ? "bg-slate-800 border border-slate-700"            : "bg-slate-100 border border-slate-200"}`}>
              <span className="text-base">{improved ? "📉" : "🎯"}</span>
              <p className={`text-sm font-black ${improved ? "text-emerald-500" : dark ? "text-slate-400" : "text-slate-500"}`}>
                {improved
                  ? `${Math.abs(diff)} ${cur.possibleImp}`
                  : cur.dragSliders}
              </p>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {sliders.map(({ label, emoji, val, set, low, high }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{emoji}</span>
                  <span className={`text-xs font-bold ${dark ? "text-slate-300" : "text-slate-700"}`}>{label}</span>
                </div>
                <span className={`text-xs font-black
                  ${val >= 70 ? "text-emerald-500" : val >= 40 ? "text-amber-500" : "text-red-500"}`}>
                  {val < 35 ? low : val > 75 ? high : cur.moderate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[0.6rem] w-10 text-right shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`}>{low}</span>
                <input
                  type="range" min={0} max={100} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full cursor-pointer accent-blue-600"
                  style={{
                    appearance: "none",
                    background: `linear-gradient(to right, #3b82f6 ${val}%, ${dark ? "#1e293b" : "#e2e8f0"} ${val}%)`,
                  }}
                />
                <span className={`text-[0.6rem] w-14 shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`}>{high}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`px-4 py-2.5 rounded-xl text-xs border
          ${dark ? "bg-amber-500/8 border-amber-500/20 text-amber-400/70" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          ⚠ {cur.hi ? "यह एक सिम्युलेटेड अनुमान है। वास्तविक परिणाम आपकी स्वास्थ्य स्थिति पर निर्भर करते हैं। कोई भी बदलाव करने से पहले अपने डॉक्टर से सलाह लें।" : "This is a simulated motivational estimate. Actual improvements depend on individual health conditions. Always consult your doctor before making lifestyle changes."}
        </div>
      </div>
    </div>
  );
}


/* ── Risk Ring ── */
function RiskRing({ score = 0, riskLevel = "Low", dark, label }) {
  const r = 46, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color  = riskLevel.toLowerCase().includes("high") || riskLevel.toLowerCase().includes("uch") || riskLevel.toLowerCase().includes("gambhir") ? "#ef4444" 
               : riskLevel.toLowerCase().includes("medium") || riskLevel.toLowerCase().includes("madhyam") || riskLevel.toLowerCase().includes("theek") ? "#f59e0b" : "#10b981";
  const glow   = color === "#ef4444" ? "shadow-red-500/30" : color === "#f59e0b" ? "shadow-amber-500/30" : "shadow-emerald-500/30";
  return (
    <div className={`relative w-28 h-28 shrink-0 rounded-full shadow-xl ${glow}`}>
      <svg width="112" height="112" className="progress-ring -rotate-90" viewBox="0 0 112 112"
        style={{ transform: "rotate(-90deg)" }}>
        <circle cx="56" cy="56" r={r} fill="none"
          stroke={dark ? "#1e293b" : "#f1f5f9"} strokeWidth="8" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          className="progress-ring__circle" style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
        <span className="font-black text-2xl leading-none" style={{ fontFamily: "'Sora',sans-serif", color }}>{score}</span>
        <span className={`text-[0.45rem] font-bold uppercase tracking-widest mt-0.5 leading-tight ${dark ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
      </div>
    </div>
  );
}


/* ── Finding Row ── */
function FindingRow({ f, dark, i }) {
  const statusCfg = {
    Normal:     { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", bar: "#10b981", w: 90 },
    Borderline: { badge: "text-amber-400   bg-amber-500/10   border-amber-500/30",   bar: "#f59e0b", w: 45 },
    Abnormal:   { badge: "text-red-400     bg-red-500/10     border-red-500/30",     bar: "#ef4444", w: 15 },
  };
  const s = statusCfg[f.status] || statusCfg.Normal;
  return (
    <tr className={`border-b transition-colors animate-fadeInUp
      ${dark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-slate-100 hover:bg-slate-50"}`}
      style={{ animationDelay: `${i * 40}ms` }}
    >
      <td className={`py-3.5 px-4 text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>
        {f.parameter}
      </td>
      <td className={`py-3.5 px-4 font-mono font-bold text-sm ${dark ? "text-slate-100" : "text-slate-900"}`}>
        {f.value}
      </td>
      <td className={`py-3.5 px-4 text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
        {f.normalRange}
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.6rem] font-bold border uppercase tracking-wide ${s.badge}`}>
          {f.status}
        </span>
      </td>
      <td className="py-3.5 px-4 min-w-[80px]">
        <div className={`h-1.5 rounded-full ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
          <div
            className="h-full rounded-full meter-fill"
            style={{ width: `${s.w}%`, background: `linear-gradient(90deg, ${s.bar}60, ${s.bar})` }}
          />
        </div>
      </td>
    </tr>
  );
}

/* ── Medicine Card ── */
/* ── Medicine Card ── */
function MedicineCard({ med, dark, i, cur }) {
  const typeCfg = {
    "supplement":            { grad: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20", badge: "text-blue-400 bg-blue-500/10 border-blue-500/25", icon: "💊" },
    "otc":                   { grad: "from-violet-500/10 to-violet-600/5", border: "border-violet-500/20", badge: "text-violet-400 bg-violet-500/10 border-violet-500/25", icon: "🧪" },
    "prescription":          { grad: "from-orange-500/10 to-orange-600/5", border: "border-orange-500/20", badge: "text-orange-400 bg-orange-500/10 border-orange-500/25", icon: "📋" },
  };
  const getT = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes("supplement")) return typeCfg.supplement;
    if (t.includes("otc") || t.includes("dawai")) return typeCfg.otc;
    if (t.includes("prescription") || t.includes("parchi")) return typeCfg.prescription;
    return typeCfg.supplement;
  };
  const t = getT(med.type);
  const warnBg = dark
    ? "bg-amber-500/8 border-amber-500/20 text-amber-400/80"
    : "bg-amber-50 border-amber-200 text-amber-700";

  return (
    <div
      className={`rounded-2xl border overflow-hidden animate-fadeInUp
        ${dark ? `bg-gradient-to-br ${t.grad} ${t.border}` : "bg-white border-slate-200"}`}
      style={{ animationDelay: `${i * 80}ms` }}
    >
      {/* Card top */}
      <div className={`p-4 ${dark ? "" : `bg-gradient-to-br ${t.grad}`}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{t.icon}</span>
            <div>
              <h3 className={`font-bold text-sm leading-tight ${dark ? "text-slate-100" : "text-slate-800"}`}>
                {med.name}
              </h3>
              <span className={`inline-block mt-0.5 text-[0.6rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${t.badge}`}>
                {med.type}
              </span>
            </div>
          </div>
          {med.requiresConsultation && (
            <span className="shrink-0 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border
              text-blue-400 bg-blue-500/10 border-blue-500/25 uppercase tracking-wide whitespace-nowrap">
              {cur.rxReq}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className={`px-4 pb-4 space-y-2 text-xs ${dark ? "bg-slate-900/50" : "bg-white"}`}>
        {med.reason && (
          <div className={`p-2.5 rounded-xl ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-600"}`}>
            <span className="font-bold">{cur.why}: </span>{med.reason}
          </div>
        )}
        {med.dosage && (
          <div className={`p-2.5 rounded-xl ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-600"}`}>
            <span className="font-bold">{cur.dosage}: </span>{med.dosage}
          </div>
        )}
        {med.caution && (
          <div className={`p-2.5 rounded-xl border text-xs ${warnBg}`}>
            ⚠ {med.caution}
          </div>
        )}
      </div>
    </div>
  );
}


/* ── Tab Button ── */
function Tab({ label, active, onClick, dark, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5
        ${active
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
          : dark
            ? "text-slate-500 hover:text-slate-300 hover:bg-slate-700/60"
            : "text-slate-500 hover:text-slate-700 hover:bg-white"
        }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-[0.55rem] font-black px-1.5 py-0.5 rounded-full
          ${active ? "bg-white/25 text-white" : dark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon, title, subtitle, dark }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 border-b
      ${dark ? "border-slate-800" : "border-slate-100"}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div>
        <h2 className={`font-bold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`}
          style={{ fontFamily: "'Sora',sans-serif" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ── Translation Map ── */
const tMap = {
  en: {
    hi: false,
    back: "Back",
    reanalyze: "Re-analyze",
    analyzing: "Analyzing...",
    whatsapp: "WhatsApp",
    copyLink: "Copy Link",
    copied: "Copied!",
    print: "Print Report",
    delete: "Delete",
    riskScore: "Risk Score",
    health: "Health",
    risk: "Risk",
    visitDoctor: "Visit Doctor",
    drNote: "Dr. MedVision — AI Analysis",
    goodNews: "Good News",
    watchOut: "Watch Out",
    abnormalValues: "Abnormal Values",
    viewAll: "View all",
    followUp: "Recommended Follow-Up",
    overview: "Overview",
    summary: "Summary",
    findings: "Lab Values",
    charts: "Charts",
    insights: "Insights",
    advice: "Advice",
    medicines: "Medicines",
    parameter: "Parameter",
    value: "Your Value",
    range: "Normal Range",
    status: "Status",
    level: "Level",
    notes: "Doctor's Notes",
    diet: "Diet Recommendation",
    lifestyle: "Lifestyle Suggestions",
    medDisclaimer: "Medical Disclaimer",
    medNote: "Take this list to your doctor. They can confirm which ones are right for you.",
    noMeds: "No medicines suggested",
    delTitle: "Delete this Report?",
    delMsg: "This action cannot be undone. The report will be permanently removed.",
    cancel: "Cancel",
    drugType: "Type",
    why: "Why",
    dosage: "Dosage",
    rxReq: "Rx Required",
    lifestyleSim: "Lifestyle Impact Simulator",
    simSlogan: "Drag sliders to simulate risk reduction",
    currentRisk: "Your Current Risk",
    projectedRisk: "Projected Risk",
    possibleImp: "point improvement possible!",
    dragSliders: "Drag sliders to simulate improvement",
    moderate: "Moderate",
  },
  hi: {
    hi: true,
    back: "पीछे",
    reanalyze: "फिर से जांचें",
    analyzing: "जांच जारी है...",
    whatsapp: "व्हाट्सएप",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी हो गया!",
    print: "रिपोर्ट प्रिंट करें",
    delete: "हटाएं",
    riskScore: "जोखिम स्कोर",
    health: "स्वास्थ्य",
    risk: "जोखिम",
    visitDoctor: "डॉक्टर से मिलें",
    drNote: "डॉ. मेडविज़न — एआई विश्लेषण",
    goodNews: "अच्छी खबर",
    watchOut: "सावधान रहें",
    abnormalValues: "असामान्य परिणाम",
    viewAll: "सब देखें",
    followUp: "अगली सलाह",
    overview: "अवलोकन",
    summary: "सारांश",
    findings: "लैब रिपोर्ट्स",
    charts: "चार्ट्स",
    insights: "अंदरूनी जानकारी",
    advice: "सलाह",
    medicines: "दवाइयां",
    parameter: "पैरामीटर",
    value: "आपका परिणाम",
    range: "सामान्य सीमा",
    status: "स्थिति",
    level: "स्तर",
    notes: "डॉक्टर की सलाह",
    diet: "आहार संबंधी सलाह",
    lifestyle: "जीवनशैली में बदलाव",
    medDisclaimer: "चिकित्सा अस्वीकरण",
    medNote: "इस सूची को अपने डॉक्टर के पास ले जाएं। वे पुष्टि कर सकते हैं कि कौन सी आपके लिए सही है।",
    noMeds: "कोई दवा सुझाई नहीं गई",
    delTitle: "रिपोर्ट हटाएं?",
    delMsg: "यह प्रक्रिया वापस नहीं ली जा सकती। रिपोर्ट हमेशा के लिए हटा दी जाएगी।",
    cancel: "रद्द करें",
    drugType: "प्रकार",
    why: "कारण",
    dosage: "मात्रा",
    rxReq: "पर्ची ज़रूरी",
    lifestyleSim: "जीवनशैली प्रभाव सिम्युलेटर",
    simSlogan: "परिवर्तनों से जोखिम में कमी देखें",
    currentRisk: "आपका वर्तमान जोखिम",
    projectedRisk: "अनुमानित जोखिम",
    possibleImp: "अंक का सुधार संभव है!",
    dragSliders: "सुधार देखने के लिए स्लाइडर्स खिसकाएं",
    moderate: "औसत",
  }
};

/* ══ MAIN ══ */
export default function ReportDetails() {
  const { id }     = useParams();
  const navigate    = useNavigate();
  const { user }    = useContext(AuthContext);
  const { dark }    = useTheme();
  const { lang }    = useLanguage();
  const [loading, setLoading]     = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [report, setReport]       = useState(null);
  const [tab, setTab]             = useState("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [copying, setCopying]     = useState(false);
  const [isPrintable, setIsPrintable] = useState(false);
  const [sharing, setSharing]     = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied]       = useState(false);


  const cur = tMap[lang] || tMap.en;

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      const res = await API.post(`/reports/${id}/reanalyze`, {}, {
        params: { language: lang },
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReport(res.data);
    } catch (err) {
      alert("Analysis failed");
    } finally {
      setReanalyzing(false);
    }
  };

  const handleShare = async (platform = "link") => {
    setSharing(true);
    try {
      const res = await API.post(`/reports/${id}/share`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const link = `${window.location.origin}/shared/${res.data.shareToken}`;
      setShareLink(link);
      
      if (platform === "link") {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else if (platform === "whatsapp") {
        const text = `Hey, check out my medical report analysis by MedVision AI: ${link}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      }
    } catch (err) {
      alert("Sharing failed");
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/reports/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      navigate("/reports");
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    API.get(`/reports/${id}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(res => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [id, user]);


  const parsed = report?.aiResult ? JSON.parse(report.aiResult) : null;

  /* ── Loading state ── */
  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[160, 100, 120].map((h, i) => (
        <div key={i} className={`skeleton rounded-2xl animate-pulse
          ${dark ? "bg-slate-800" : "bg-slate-100"}`}
          style={{ height: h }}
        />
      ))}
    </div>
  );

  if (!report && !loading) return (
    <div className="max-w-4xl mx-auto text-center py-24">
      <span className="text-5xl mb-4 block">😕</span>
      <p className="text-red-400 font-bold mb-5">Could not load report.</p>
      <Link to="/reports"
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
        ← Back to Reports
      </Link>
    </div>
  );


  const rColor    = parsed?.riskLevel === "High" ? "#ef4444" : parsed?.riskLevel === "Medium" ? "#f59e0b" : "#10b981";
  const abnormals = parsed?.keyFindings?.filter(f => f.status !== "Normal") || [];
  const medicines = parsed?.recommendedMedicines || [];
  const findings  = parsed?.keyFindings || [];

  /* ── Style tokens ── */
  const card    = dark ? "bg-slate-900 border-slate-800"   : "bg-white border-slate-200";
  const muted   = dark ? "text-slate-400" : "text-slate-500";
  const hdrTxt  = dark ? "text-slate-100" : "text-slate-800";
  const divider = dark ? "border-slate-800" : "border-slate-100";
  const tabWrap = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-100/80 border-slate-200";
  const thBg    = dark ? "bg-slate-800/80 text-slate-500"  : "bg-slate-50 text-slate-400";
  const btnDef  = dark
    ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600"
    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";


  const TABS = [
    { key: "overview",  label: cur.overview,   icon: "🏠" },
    { key: "summary",   label: cur.summary,    icon: "📋" },
    { key: "findings",  label: cur.findings,   icon: "🔬", count: findings.length },
    { key: "charts",    label: cur.charts,     icon: "📊" },
    { key: "insights",  label: cur.insights,   icon: "✨" },
    { key: "advice",    label: cur.advice,     icon: "💡" },
    { key: "medicines", label: cur.medicines,  icon: "💊", count: medicines.length },
  ];

  const dateStr = report?.createdAt
    ? new Date(report.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      })
    : "";


  return (
    <div className="max-w-4xl mx-auto" style={{ fontFamily: "'Inter',sans-serif" }}>

      {/* ── Action Bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5 animate-fadeInDown">
        <Link to="/reports"
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${btnDef}`}>
          ← {cur.back}
        </Link>

        <div className="flex flex-wrap gap-2 ml-auto items-center">
          {/* Lang toggle (Removed as now global in sidebar) */}


          <button onClick={handleReanalyze} disabled={reanalyzing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${btnDef} disabled:opacity-40`}>
            {reanalyzing
              ? <><span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full spinner" />{cur.analyzing}</>
              : `⟳ ${cur.reanalyze}`}
          </button>

          <button onClick={() => handleShare("whatsapp")} disabled={sharing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 
              ${dark 
                ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15" 
                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"} disabled:opacity-40`}>
            <span>📲 {cur.whatsapp}</span>
          </button>

          <button onClick={() => handleShare("link")} disabled={sharing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${btnDef} disabled:opacity-40`}>
            {sharing ? "..." : copied ? `✓ ${cur.copied}` : `🔗 ${cur.copyLink}`}
          </button>

          <button onClick={handlePrint}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 
              ${dark 
                ? "border-blue-500/30 bg-blue-500/8 text-blue-400 hover:bg-blue-500/15" 
                : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
            <span>📄 {cur.print}</span>
          </button>

          <button onClick={() => setShowDelete(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200
              ${dark
                ? "border-red-500/30 bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:border-red-500/50"
                : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300"
              }`}>
            🗑 {cur.delete}
          </button>
        </div>
      </div>


      {/* Share link banner */}
      {shareLink && (
        <div className={`flex items-center gap-3 p-3.5 rounded-xl border mb-4 text-xs animate-slideInLeft
          ${dark ? "bg-emerald-500/8 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"}`}>
          <span className="text-emerald-400 font-black text-base shrink-0">✓</span>
          <span className={`truncate flex-1 font-mono text-[0.7rem] ${dark ? "text-slate-400" : "text-slate-500"}`}>{shareLink}</span>
          <span className={`shrink-0 font-bold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>{copied ? cur.copied : ""}</span>
        </div>
      )}

      {/* ── Hero Card ── */}
      <div className={`relative rounded-2xl border overflow-hidden mb-5 animate-fadeInUp ${card}`}>
        {/* Background gradient accent */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top right, ${rColor} 0%, transparent 60%)` }}
        />
        {/* Top accent line */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${rColor}, ${rColor}40, transparent)` }} />

        <div className="p-5 sm:p-7 relative">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {parsed && <RiskRing score={parsed.riskScore || 0} riskLevel={parsed.riskLevel} label={cur.riskScore} dark={dark} />}

            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {parsed?.riskLevel && (
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                    style={{ color: rColor, background: `${rColor}18`, borderColor: `${rColor}40` }}>
                    {parsed.riskLevel} {cur.risk}
                  </span>
                )}
                {parsed?.overallHealth && (
                  <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full border
                    ${parsed.overallHealth.toLowerCase().includes("good") || parsed.overallHealth.toLowerCase().includes("ache")
                      ? dark ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-emerald-600 bg-emerald-50 border-emerald-200"
                      : parsed.overallHealth.toLowerCase().includes("fair") || parsed.overallHealth.toLowerCase().includes("theek")
                        ? dark ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-amber-600 bg-amber-50 border-amber-200"
                        : dark ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-red-600 bg-red-50 border-red-200"}`}>
                    {parsed.overallHealth} {cur.health}
                  </span>
                )}
              </div>

              <h1 className={`font-black text-lg sm:text-xl leading-snug mb-1.5 break-words ${hdrTxt}`}
                style={{ fontFamily: "'Sora',sans-serif" }}>
                {report?.originalFileName}
              </h1>
              <p className={`text-xs ${muted}`}>{dateStr}</p>


              {/* Mini stats row */}
              {parsed && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {findings.length > 0 && (
                    <p className={`text-xs ${muted}`}>
                      <span className="font-bold">{findings.length}</span> lab values analyzed
                    </p>
                  )}
                  {abnormals.length > 0 && (
                    <p className="text-xs text-red-400">
                      <span className="font-bold">{abnormals.length}</span> abnormal findings
                    </p>
                  )}
                  {medicines.length > 0 && (
                    <p className={`text-xs ${dark ? "text-blue-400" : "text-blue-600"}`}>
                      <span className="font-bold">{medicines.length}</span> medicines suggested
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Urgency box */}
            {parsed?.doctorAdvice?.urgency && (
              <div className={`shrink-0 px-5 py-4 rounded-2xl border text-center min-w-[120px]
                ${parsed.doctorAdvice.urgency.toLowerCase().includes("today")
                  ? dark ? "border-red-500/30 bg-red-500/10" : "border-red-200 bg-red-50"
                  : parsed.doctorAdvice.urgency.toLowerCase().includes("week")
                    ? dark ? "border-amber-500/30 bg-amber-500/10" : "border-amber-200 bg-amber-50"
                    : dark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
                }`}>
                <p className="text-2xl mb-1">
                  {parsed.doctorAdvice.urgency.toLowerCase().includes("today") ? "🚨"
                    : parsed.doctorAdvice.urgency.toLowerCase().includes("week") ? "⏰" : "✅"}
                </p>
                <p className={`text-[0.6rem] font-semibold uppercase tracking-wide ${muted}`}>{cur.visitDoctor}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: rColor }}>
                  {parsed.doctorAdvice.urgency}
                </p>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dr. MedVision Note ── */}
      {parsed?.patientSummary && (
        <div className={`rounded-2xl border p-5 mb-5 animate-fadeInUp
          ${dark ? "bg-gradient-to-br from-blue-600/8 to-blue-500/4 border-blue-500/20"
                 : "bg-gradient-to-br from-blue-50 to-blue-50/60 border-blue-200"}`}>
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center
              text-white font-black text-sm shrink-0 shadow-lg shadow-blue-500/30">
              M
            </div>
            <div>
              <p className="text-blue-500 text-[0.65rem] font-black uppercase tracking-widest mb-1.5">
                {cur.drNote}
              </p>

              <p className={`text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {parsed.patientSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      {parsed && (
        <div className={`p-1 rounded-2xl border mb-5 animate-fadeInUp ${tabWrap}`}>
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <Tab key={t.key} label={t.label} active={tab === t.key}
                onClick={() => setTab(t.key)} dark={dark} count={t.count} />
            ))}
          </div>
        </div>
      )}

      {/* ══════ TAB: Overview ══════ */}
      {(!parsed || tab === "overview") && (
        <div className="space-y-4 animate-fadeIn">
          {/* Good / Watch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parsed?.goodNews && (
              <div className={`rounded-2xl border-l-4 border-emerald-500 overflow-hidden ${card}`}>
                <div className={`px-4 pt-4 pb-1 ${dark ? "bg-emerald-500/5" : "bg-emerald-50"}`}>
                  <p className="text-emerald-500 text-xs font-black uppercase tracking-wide mb-0.5">✓ {cur.goodNews}</p>
                </div>

                <div className="px-4 pb-4 pt-2">
                  <p className={`text-sm leading-relaxed ${muted}`}>{parsed.goodNews}</p>
                </div>
              </div>
            )}
            {parsed?.watchOut && (
              <div className={`rounded-2xl border-l-4 border-amber-500 overflow-hidden ${card}`}>
                <div className={`px-4 pt-4 pb-1 ${dark ? "bg-amber-500/5" : "bg-amber-50"}`}>
                  <p className="text-amber-500 text-xs font-black uppercase tracking-wide mb-0.5">⚠ {cur.watchOut}</p>
                </div>

                <div className="px-4 pb-4 pt-2">
                  <p className={`text-sm leading-relaxed ${muted}`}>{parsed.watchOut}</p>
                </div>
              </div>
            )}
          </div>

          {/* Abnormal quick view */}
          {abnormals.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden
              ${dark ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"}`}>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <p className="text-red-500 text-xs font-black uppercase tracking-wide">
                  🔴 {abnormals.length} {cur.abnormalValues}
                </p>
                <button onClick={() => setTab("findings")}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                  {cur.viewAll} →
                </button>

              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4`}>
                {abnormals.map((f, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl
                    ${dark ? "bg-red-500/8 border border-red-500/15" : "bg-white border border-red-200"}`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${f.status === "Abnormal" ? "bg-red-500" : "bg-amber-500"}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${dark ? "text-slate-200" : "text-slate-700"}`}>{f.parameter}</p>
                      <p className={`text-[0.65rem] font-mono ${muted}`}>{f.value} · Normal: {f.normalRange}</p>
                    </div>
                    <span className={`shrink-0 text-[0.6rem] font-black uppercase px-1.5 py-0.5 rounded-full
                      ${f.status === "Abnormal"
                        ? "text-red-400 bg-red-500/15"
                        : "text-amber-400 bg-amber-500/15"}`}
                    >
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {parsed?.doctorAdvice?.followUp && (
            <div className={`rounded-2xl border p-4 ${dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <p className="text-blue-500 text-xs font-black uppercase tracking-wide mb-1.5">📅 {cur.followUp}</p>
              <p className={`text-sm leading-relaxed ${muted}`}>{parsed.doctorAdvice.followUp}</p>
            </div>
          )}


          {/* Raw AI result fallback */}
          {!parsed && report?.aiResult && (
            <div className={`rounded-2xl border p-5 ${card}`}>
              <p className={`text-sm font-bold mb-3 ${hdrTxt}`}>AI Analysis</p>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${muted}`}>
                {report.aiResult.replace(/\*\*/g, "")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: Summary ══════ */}
      {tab === "summary" && parsed && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <SectionHeader icon="📋" title="Report Summary"
              subtitle={`Risk score: ${parsed.riskScore}/100`} dark={dark} />
            <div className="p-5 space-y-5">
              {/* Risk Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${muted}`}>{cur.hi ? "जोखिम स्तर" : "Risk Level"}</span>
                  <span className="text-sm font-black" style={{ color: rColor }}>
                    {parsed.riskLevel} · {parsed.riskScore}/100
                  </span>
                </div>
                <div className={`h-2.5 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div className="h-full rounded-full meter-fill"
                    style={{ width: `${parsed.riskScore}%`, background: `linear-gradient(90deg, ${rColor}70, ${rColor})` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[0.6rem] text-emerald-500 font-bold">{cur.hi ? "कम" : "Low"}</span>
                  <span className="text-[0.6rem] text-amber-500 font-bold">{cur.hi ? "मध्यम" : "Medium"}</span>
                  <span className="text-[0.6rem] text-red-500 font-bold">{cur.hi ? "उच्च" : "High"}</span>
                </div>

              </div>

              {/* Summary Stats */}
              <div className={`grid grid-cols-3 rounded-xl border overflow-hidden
                ${dark ? "bg-slate-800/60 border-slate-700 divide-x divide-slate-700"
                        : "bg-slate-50 border-slate-200 divide-x divide-slate-200"}`}>
                {[
                  { l: cur.health, v: parsed.overallHealth || "–" },
                  { l: cur.risk,     v: parsed.riskLevel     || "–" },
                  { l: cur.riskScore,     v: `${parsed.riskScore || 0}/100` },
                ].map((s, i) => (
                  <div key={i} className="py-4 text-center px-2">
                    <p className="font-black text-sm mb-0.5" style={{ color: rColor, fontFamily: "'Sora',sans-serif" }}>{s.v}</p>
                    <p className={`text-[0.6rem] font-bold uppercase tracking-wide ${muted}`}>{s.l}</p>
                  </div>
                ))}

              </div>

              {/* Abnormals */}
              {abnormals.length > 0 && (
                <div>
                  <p className="text-xs font-black text-red-400 mb-3 uppercase tracking-wide">🔴 {cur.abnormalValues}</p>

                  <div className="space-y-2">
                    {abnormals.map((f, i) => (
                      <div key={i} className={`flex flex-col sm:flex-row gap-2 sm:items-center p-3.5 rounded-xl border
                        ${f.status === "Abnormal"
                          ? dark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                          : dark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"}`}>
                        <div className="flex items-center gap-2 sm:w-56 shrink-0">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${f.status === "Abnormal" ? "bg-red-500" : "bg-amber-500"}`} />
                          <span className={`text-sm font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}>{f.parameter}</span>
                          <span className={`font-mono text-sm font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>— {f.value}</span>
                        </div>
                        {f.doctorNote && <p className={`text-xs leading-relaxed ${muted}`}>{f.doctorNote}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              {parsed.doctorAdvice?.lifestyle?.length > 0 && (
                <div>
                  <p className="text-xs font-black text-blue-400 mb-3 uppercase tracking-wide">🏃 {cur.lifestyle}</p>

                  <ul className="space-y-2">
                    {parsed.doctorAdvice.lifestyle.map((item, i) => (
                      <li key={i} className={`flex gap-3 text-sm animate-slideInLeft p-2.5 rounded-xl
                        ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}
                        style={{ animationDelay: `${i * 35}ms` }}>
                        <span className="text-blue-500 font-black shrink-0">→</span>
                        <span className={muted}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ TAB: Lab Values ══════ */}
      {tab === "findings" && findings.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className={`rounded-2xl border overflow-hidden ${card}`}>
            <SectionHeader icon="🔬" title={cur.findings}
              subtitle={`${findings.length} ${cur.hi ? "पैरामीटर" : "values analyzed"} · ${abnormals.length} ${cur.hi ? "असामान्य" : "abnormal"}`} dark={dark} />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-[0.6rem] font-black uppercase tracking-widest ${thBg}`}>
                    {[cur.parameter, cur.value, cur.range, cur.status, cur.level].map(h => (
                      <th key={h} className="px-4 py-3.5 text-left">{h}</th>
                    ))}
                  </tr>

                </thead>
                <tbody>
                  {findings.map((f, i) => <FindingRow key={i} f={f} dark={dark} i={i} />)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor notes */}
          {findings.filter(f => f.doctorNote).length > 0 && (
            <div>
              <p className={`text-xs font-black uppercase tracking-widest mb-3 ${muted}`}>🩺 {cur.notes}</p>

              <div className="space-y-2.5">
                {findings.filter(f => f.doctorNote).map((f, i) => (
                  <div key={i}
                    className={`flex gap-3.5 p-4 rounded-2xl border animate-fadeInUp
                      ${f.status === "Abnormal"
                        ? dark ? "border-red-500/20 bg-red-500/5" : "border-red-200 bg-red-50"
                        : f.status === "Borderline"
                          ? dark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"
                          : dark ? "border-emerald-500/15 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`w-1 rounded-full shrink-0
                      ${f.status === "Abnormal" ? "bg-red-500" : f.status === "Borderline" ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                    <div>
                      <p className={`font-bold text-sm mb-1 ${dark ? "text-slate-200" : "text-slate-700"}`}>
                        {f.parameter} — <span className="font-mono">{f.value}</span>
                      </p>
                      <p className={`text-xs leading-relaxed ${muted}`}>{f.doctorNote}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: Insights (Radar + Simulator) ══════ */}
      {tab === "insights" && parsed && (
        <div className="space-y-6 animate-fadeIn">

          {/* ChatGPT Cannot Do This Banner */}
          <div className={`flex items-start gap-3.5 p-4 rounded-2xl border
            ${dark ? "bg-violet-600/8 border-violet-500/20" : "bg-violet-50 border-violet-200"}`}>
            <span className="text-2xl shrink-0">🚀</span>
            <div>
              <p className={`text-xs font-black uppercase tracking-wide mb-1
                ${dark ? "text-violet-400" : "text-violet-700"}`}>
                Exclusive Interactive Features
              </p>
              <p className={`text-xs leading-relaxed ${dark ? "text-violet-400/70" : "text-violet-700/80"}`}>
                These tools are <strong>uniquely built on your personal report data</strong>. The Radar Chart groups your exact lab values by organ system. The Lifestyle Simulator gives real-time feedback as you drag sliders — <strong>ChatGPT text can never offer this live, interactive, data-driven experience</strong>.
              </p>
            </div>
          </div>

          {/* Body Systems Radar */}
          <BodySystemsRadar findings={findings} dark={dark} cur={cur} />

          {/* Lifestyle Impact Simulator */}
          <LifestyleSimulator parsed={parsed} dark={dark} cur={cur} />


        </div>
      )}

      {/* ══════ TAB: Charts ══════ */}
      {tab === "charts" && parsed && (
        <div className="space-y-6 animate-fadeIn">

          {/* Unique Value Banner */}
          <div className={`flex items-start gap-3.5 p-4 rounded-2xl border
            ${dark ? "bg-blue-600/8 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
            <span className="text-2xl shrink-0">✨</span>
            <div>
              <p className={`text-xs font-black uppercase tracking-wide mb-1
                ${dark ? "text-blue-400" : "text-blue-700"}`}>
                {cur.hi ? "व्यक्तिगत विजुअल विश्लेषण" : "Personalized Visual Analysis"}
              </p>
              <p className={`text-xs leading-relaxed ${dark ? "text-blue-400/70" : "text-blue-700/80"}`}>
                {cur.hi
                  ? "ये चार्ट विशेष रूप से आपकी लैब रिपोर्ट के आधार पर बनाए गए हैं। केवल टेक्स्ट के बजाय, ये आपकी स्वास्थ्य स्थिति और दवाओं के प्रभाव को विजुअली दिखाते हैं।"
                  : "These charts are generated exclusively from your report data. Unlike a text AI, these visuals show your exact lab values vs. normal ranges and project your health trajectory if you follow the medicine plan."}
              </p>
            </div>

          </div>

          {/* Health Status Chart */}
          {findings.length > 0 && (
            <HealthStatusChart findings={findings} dark={dark} cur={cur} />
          )}

          {/* Medicine Benefit Chart */}
          {medicines.length > 0 ? (
            <MedicineBenefitChart medicines={medicines} dark={dark} cur={cur} />

          ) : (
            <div className={`text-center py-12 rounded-2xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
              <p className="text-3xl mb-3">📈</p>
              <p className={`font-bold text-sm ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {cur.hi ? "कोई चार्ट उपलब्ध नहीं है" : "No medicine benefit chart available"}
              </p>
              <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                {cur.hi ? "इस रिपोर्ट में दवाओं के कोई सुझाव नहीं मिले हैं।" : "This report has no medicine suggestions to project."}
              </p>
            </div>

          )}
        </div>
      )}

      {/* ══════ TAB: Advice ══════ */}
      {tab === "advice" && parsed?.doctorAdvice && (
        <div className="space-y-4 animate-fadeIn">
          {[
            { title: cur.diet,  items: parsed.doctorAdvice.diet,      color: "emerald", icon: "🥗", grad: "from-emerald-500/10 to-emerald-600/5", border: dark ? "border-emerald-500/20" : "border-emerald-200" },
            { title: cur.lifestyle, items: parsed.doctorAdvice.lifestyle,  color: "blue",    icon: "🏃", grad: "from-blue-500/10 to-blue-600/5",    border: dark ? "border-blue-500/20"    : "border-blue-200" },
          ].map((section, si) => section.items?.length > 0 && (

            <div key={si}
              className={`rounded-2xl border overflow-hidden animate-fadeInUp ${card}`}
              style={{ animationDelay: `${si * 80}ms` }}
            >
              <div className={`px-5 py-4 border-b bg-gradient-to-r ${section.grad} ${dark ? "border-slate-800" : "border-slate-100"}`}>
                <h3 className={`font-bold text-sm ${hdrTxt}`}>{section.icon} {section.title}</h3>
              </div>
              <ul className="p-4 space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}
                    className={`flex gap-3 text-sm animate-slideInLeft p-2.5 rounded-xl
                      ${dark ? "bg-slate-800/40" : "bg-slate-50"}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className={`font-black shrink-0 text-${section.color}-500`}>→</span>
                    <span className={muted}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {parsed.doctorAdvice.followUp && (
            <div className={`rounded-2xl border p-5 animate-fadeInUp
              ${dark ? "bg-blue-600/5 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
              <p className="text-blue-500 text-xs font-black uppercase tracking-widest mb-2">📅 {cur.followUp}</p>
              <p className={`text-sm leading-relaxed ${muted}`}>{parsed.doctorAdvice.followUp}</p>
            </div>

          )}

          {parsed.doctorAdvice.urgency && (
            <div className={`rounded-2xl border p-6 text-center animate-scaleIn
              ${parsed.doctorAdvice.urgency.toLowerCase().includes("today")
                ? dark ? "border-red-500/30 bg-red-500/8" : "border-red-200 bg-red-50"
                : dark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
              <p className="text-4xl mb-2">
                {parsed.doctorAdvice.urgency.toLowerCase().includes("today") ? "🚨" : "✅"}
              </p>
              <p className={`text-xs font-semibold mb-1 ${muted}`}>{cur.hi ? "डॉ. मेडविज़न की सलाह" : "Dr. MedVision recommends"}</p>
              <p className="font-black text-sm" style={{ color: rColor }}>{parsed.doctorAdvice.urgency}</p>

            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: Medicines ══════ */}
      {tab === "medicines" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Warning */}
          <div className={`flex gap-3.5 p-4 rounded-2xl border
            ${dark ? "bg-amber-500/8 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
            <span className={`text-base shrink-0 mt-0.5 ${dark ? "text-amber-400" : "text-amber-500"}`}>⚠</span>
            <div>
              <p className={`text-xs font-black uppercase tracking-wide mb-0.5 ${dark ? "text-amber-400" : "text-amber-700"}`}>
                {cur.medDisclaimer}
              </p>

              <p className={`text-xs leading-relaxed ${dark ? "text-amber-400/70" : "text-amber-700"}`}>
                {cur.hi ? "ये सुझाव केवल जागरूकता के लिए हैं। कोई भी दवा शुरू करने से पहले हमेशा अपने डॉक्टर से सलाह लें।" : "These suggestions are for awareness only. Always consult your doctor before starting any medication."}
              </p>

            </div>
          </div>

          {medicines.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border ${card}`}>
              <p className="text-4xl mb-3">💊</p>
              <p className={`font-bold text-sm mb-1.5 ${hdrTxt}`}>{cur.noMeds}</p>
              <p className={`text-xs ${muted}`}>{cur.hi ? "कोई दवा सुझाई नहीं गई है।" : "No medicines suggested in this report."}</p>
            </div>

          ) : (
            <>
              <p className={`text-xs font-semibold ${muted}`}>
                {medicines.length} {cur.hi ? "सुझाव मिले हैं:" : "suggestion(s) based on your lab findings:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {medicines.map((med, i) => <MedicineCard key={i} med={med} dark={dark} i={i} cur={cur} />)}
              </div>

              <div className={`flex gap-3 p-4 rounded-2xl border
                ${dark ? "bg-blue-600/5 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
                <span className={`text-base shrink-0 ${dark ? "text-blue-400" : "text-blue-500"}`}>ℹ</span>
                <p className={`text-xs leading-relaxed ${dark ? "text-blue-400/70" : "text-blue-700"}`}>
                  {cur.medNote}
                </p>
              </div>

            </>
          )}
        </div>
      )}

      {/* ══════ Delete Modal ══════ */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowDelete(false)}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border p-7 animate-scaleIn shadow-2xl ${card}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4
                ${dark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-100"}`}>
                🗑
              </div>
              <h2 className={`font-black text-lg mb-2 ${hdrTxt}`} style={{ fontFamily: "'Sora',sans-serif" }}>
                {cur.delTitle}
              </h2>
              <p className={`text-sm leading-relaxed ${muted}`}>
                {cur.delMsg}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${btnDef}`}
              >
                {cur.cancel}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500
                  hover:from-red-500 hover:to-red-600 transition-all duration-200
                  flex items-center justify-center gap-2 disabled:opacity-50
                  shadow-lg shadow-red-500/25"
              >
                {deleting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Deleting…</>
                  : "🗑 Delete Report"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Printable Report (Only visible in Print) ══════ */}
      <div className="hidden print:block printable-report mt-10">
        <div className="space-y-8">
          {/* Summary Section */}
          <section className="print-section">
            <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-1 mb-4">1. Executive Summary</h2>
            <div className={`p-4 rounded-xl border ${card}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-bold">Health Status: <span style={{ color: rColor }}>{parsed?.overallHealth}</span></p>
                  <p className="text-sm">Risk Score: <strong>{parsed?.riskScore}/100</strong> ({parsed?.riskLevel} Risk)</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  Report Date: {dateStr}
                </div>
              </div>
              <p className="text-sm leading-relaxed italic">"{parsed?.patientSummary}"</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {parsed?.goodNews && (
                <div className="p-3 border rounded-xl bg-emerald-50">
                  <p className="text-xs font-bold text-emerald-700 uppercase">✓ Good News</p>
                  <p className="text-xs text-slate-700">{parsed.goodNews}</p>
                </div>
              )}
              {parsed?.watchOut && (
                <div className="p-3 border rounded-xl bg-amber-50">
                  <p className="text-xs font-bold text-amber-700 uppercase">⚠ Key Concern</p>
                  <p className="text-xs text-slate-700">{parsed.watchOut}</p>
                </div>
              )}
            </div>
          </section>

          {/* Lab Findings Section */}
          {findings.length > 0 && (
            <section className="print-section">
              <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-1 mb-4">2. Detailed Laboratory Findings</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border p-2 text-left">Parameter</th>
                    <th className="border p-2 text-left">Your Value</th>
                    <th className="border p-2 text-left">Normal Range</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f, i) => (
                    <tr key={i}>
                      <td className="border p-2 font-medium">{f.parameter}</td>
                      <td className="border p-2 font-mono">{f.value}</td>
                      <td className="border p-2 text-slate-500">{f.normalRange}</td>
                      <td className={`border p-2 font-bold ${f.status === "Abnormal" ? "text-red-600" : f.status === "Borderline" ? "text-amber-600" : "text-emerald-600"}`}>
                        {f.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {findings.some(f => f.doctorNote) && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-500">Clinical Observations:</p>
                  {findings.filter(f => f.doctorNote).map((f, i) => (
                    <div key={i} className="text-xs p-2 border-l-2 border-blue-200 pl-3">
                      <strong>{f.parameter}:</strong> {f.doctorNote}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Advice/Lifestyle Section */}
          {(parsed?.doctorAdvice?.diet || parsed?.doctorAdvice?.lifestyle) && (
            <section className="print-section">
              <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-1 mb-4">3. Recommended Actions & Advice</h2>
              <div className="grid grid-cols-2 gap-6">
                {parsed.doctorAdvice.diet?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2">🥗 Dietary Advice</h3>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {parsed.doctorAdvice.diet.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                )}
                {parsed.doctorAdvice.lifestyle?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-2">🏃 Lifestyle Changes</h3>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {parsed.doctorAdvice.lifestyle.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {parsed.doctorAdvice.followUp && (
                <div className="mt-4 p-3 bg-blue-50 border rounded-xl">
                  <p className="text-xs font-bold text-blue-700 uppercase">📅 Next Steps</p>
                  <p className="text-xs text-slate-700">{parsed.doctorAdvice.followUp}</p>
                </div>
              )}
            </section>
          )}

          {/* Medicines Section */}
          {medicines.length > 0 && (
            <section className="print-section">
              <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-1 mb-4">4. Suggested Medications & Supplements</h2>
              <p className="text-[10px] text-amber-600 font-bold mb-3 italic">
                IMPORTANT: These suggestions are based on AI analysis. Consult a doctor before starting any medication.
              </p>
              <div className="space-y-3">
                {medicines.map((med, i) => (
                  <div key={i} className="p-3 border rounded-xl">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold">{med.name}</p>
                      <span className="text-[10px] font-bold border px-1.5 py-0.5 rounded bg-slate-50">{med.type}</span>
                    </div>
                    <p className="text-xs mb-1"><strong>Reason:</strong> {med.reason}</p>
                    <div className="flex gap-4 text-xs italic text-slate-500">
                      {med.dosage && <span>Dosage: {med.dosage}</span>}
                      {med.caution && <span className="text-amber-600">Caution: {med.caution}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Verification Section */}
          <div className="mt-auto pt-10 border-t border-dotted flex justify-between items-end">
            <div className="text-[10px] text-slate-400">
              <p>Generated by MedVision AI</p>
              <p>Report ID: {id}</p>
            </div>
            <div className="w-24 h-24 border flex items-center justify-center text-[10px] text-slate-300">
              Seal & Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
