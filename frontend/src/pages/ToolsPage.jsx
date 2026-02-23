import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

// ─── BMI Calculator ───
function BMICalculator({ dark }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bmi = height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : null;
  const category = bmi === null ? "" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const catColor = bmi === null ? "" : bmi < 18.5 ? "text-blue-400" : bmi < 25 ? "text-emerald-400" : bmi < 30 ? "text-amber-400" : "text-red-400";
  const progress = bmi ? Math.min((parseFloat(bmi) / 40) * 100, 100) : 0;
  const barColor = bmi < 18.5 ? "#3b82f6" : bmi < 25 ? "#10b981" : bmi < 30 ? "#f59e0b" : "#ef4444";

  const card   = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const input  = dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-300 text-slate-900 focus:border-blue-500";
  const label  = dark ? "text-slate-400" : "text-slate-500";
  const muted  = dark ? "text-slate-400" : "text-slate-500";
  const tipBg  = dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200";

  return (
    <div className={`rounded-xl border p-5 sm:p-6 ${card}`}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${dark ? "bg-slate-800" : "bg-blue-50"}`}>⚖️</div>
        <div>
          <h2 className={`font-semibold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`} style={{ fontFamily:"'Sora',sans-serif" }}>BMI Calculator</h2>
          <p className={`text-xs ${muted}`}>Body Mass Index</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={`block text-xs font-medium mb-1 ${label}`}>Height (cm)</label>
          <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${input}`} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1 ${label}`}>Weight (kg)</label>
          <input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${input}`} />
        </div>
      </div>

      {bmi && (
        <div className="animate-scaleIn">
          <div className={`rounded-xl p-4 mb-3 border text-center ${tipBg}`}>
            <p className="font-black text-4xl mb-1" style={{ fontFamily:"'Sora',sans-serif", color: barColor }}>{bmi}</p>
            <p className={`font-bold text-sm ${catColor}`}>{category}</p>
          </div>
          <div className={`h-2 rounded-full overflow-hidden mb-3 ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
            <div className="h-full rounded-full meter-fill" style={{ width:`${progress}%`, background:barColor }} />
          </div>
          <div className={`grid grid-cols-4 text-center text-[0.6rem] font-semibold ${muted}`}>
            <span className="text-blue-400">Under<br/>weight</span>
            <span className="text-emerald-400">Normal<br/>&lt;25</span>
            <span className="text-amber-400">Over<br/>weight</span>
            <span className="text-red-400">Obese<br/>&gt;30</span>
          </div>
        </div>
      )}

      {/* Reference tips */}
      <div className={`mt-4 rounded-lg p-3 border text-xs space-y-1 ${tipBg}`}>
        <p className={`font-semibold mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>What your BMI means:</p>
        {[["< 18.5","Underweight — eat more nutritious foods","text-blue-400"],["18.5–24.9","Normal — maintain healthy lifestyle","text-emerald-400"],["25–29.9","Overweight — reduce calories, exercise more","text-amber-400"],["≥ 30","Obese — consult a doctor urgently","text-red-400"]].map(([r,d,c],i) => (
          <div key={i} className="flex gap-2">
            <span className={`font-bold shrink-0 w-16 ${c}`}>{r}</span>
            <span className={muted}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Normal Ranges Reference ───
const NORMAL_RANGES = [
  { category:"Blood Sugar", tests:[
    { name:"Fasting Glucose",     normal:"70–100 mg/dL",  borderline:"100–125",  concern:">126" },
    { name:"HbA1c",               normal:"Below 5.7%",    borderline:"5.7–6.4%", concern:"≥ 6.5%" },
    { name:"Post-meal Glucose",   normal:"< 140 mg/dL",   borderline:"140–199",  concern:"≥ 200" },
  ]},
  { category:"Lipid Profile", tests:[
    { name:"Total Cholesterol",   normal:"< 200 mg/dL",   borderline:"200–239",  concern:"≥ 240" },
    { name:"LDL (Bad)",           normal:"< 100 mg/dL",   borderline:"100–159",  concern:"≥ 160" },
    { name:"HDL (Good) — Male",   normal:"> 40 mg/dL",    borderline:"35–40",    concern:"< 35" },
    { name:"Triglycerides",       normal:"< 150 mg/dL",   borderline:"150–199",  concern:"≥ 200" },
  ]},
  { category:"Kidney Function", tests:[
    { name:"Creatinine — Male",   normal:"0.7–1.3 mg/dL", borderline:"1.3–1.7",  concern:"> 1.7" },
    { name:"BUN",                 normal:"7–20 mg/dL",    borderline:"20–25",    concern:"> 25" },
    { name:"Uric Acid — Male",    normal:"3.5–7.2 mg/dL", borderline:"7.2–9.0",  concern:"> 9.0" },
  ]},
  { category:"Liver Function", tests:[
    { name:"ALT (SGPT)",          normal:"7–56 U/L",      borderline:"56–100",   concern:"> 100" },
    { name:"AST (SGOT)",          normal:"10–40 U/L",     borderline:"40–80",    concern:"> 80" },
    { name:"Total Bilirubin",     normal:"0.1–1.2 mg/dL", borderline:"1.2–2.0",  concern:"> 2.0" },
  ]},
  { category:"Blood Count (CBC)", tests:[
    { name:"Haemoglobin — Male",  normal:"13.5–17.5 g/dL",borderline:"12–13.5",  concern:"< 12" },
    { name:"WBC",                 normal:"4,500–11,000",  borderline:"11–15k",   concern:"> 15k" },
    { name:"Platelets",           normal:"150k–450k",     borderline:"100–150k", concern:"< 100k" },
  ]},
  { category:"Thyroid", tests:[
    { name:"TSH",                 normal:"0.4–4.0 mIU/L", borderline:"4.0–10.0", concern:"> 10" },
    { name:"T3",                  normal:"80–200 ng/dL",  borderline:"60–80",    concern:"< 60" },
    { name:"T4",                  normal:"5.0–12.0 μg/dL",borderline:"–",        concern:"< 4.5 or >13" },
  ]},
];

function NormalRanges({ dark }) {
  const [open, setOpen] = useState(0);
  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const rowHov = dark ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50";
  const hdrTxt = dark ? "text-slate-200" : "text-slate-800";
  const catBtn = (i) => i === open
    ? "bg-blue-600 border-blue-600 text-white"
    : dark ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300";

  return (
    <div className={`rounded-xl border p-5 sm:p-6 ${card}`}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${dark ? "bg-slate-800" : "bg-blue-50"}`}>📋</div>
        <h2 className={`font-semibold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`} style={{ fontFamily:"'Sora',sans-serif" }}>Normal Reference Ranges</h2>
      </div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {NORMAL_RANGES.map((c, i) => (
          <button key={i} onClick={() => setOpen(i)} className={`px-2.5 py-1 rounded text-[0.65rem] font-semibold border transition-all duration-200 ${catBtn(i)}`}>
            {c.category}
          </button>
        ))}
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`text-[0.6rem] uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {["Test","Normal","Borderline","Concern"].map(h => <th key={h} className="py-2 px-3 text-left font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {NORMAL_RANGES[open].tests.map((t, i) => (
              <tr key={i} className={`border-b transition-colors animate-fadeInUp ${rowHov}`} style={{ animationDelay:`${i*40}ms` }}>
                <td className={`py-2.5 px-3 font-medium ${hdrTxt}`}>{t.name}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-semibold">{t.normal}</td>
                <td className="py-2.5 px-3 text-amber-400">{t.borderline || "–"}</td>
                <td className="py-2.5 px-3 text-red-400">{t.concern}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`text-[0.6rem] mt-3 ${muted}`}>⚠ These are general reference ranges. Your lab may use slightly different values.</p>
    </div>
  );
}

// ─── Symptom Checker ───
const SYMPTOM_GROUPS = {
  "Fatigue & Energy":  ["Constant tiredness", "Weakness", "Brain fog", "Low motivation"],
  "Digestive":         ["Bloating", "Nausea", "Constipation", "Diarrhea", "Heartburn"],
  "Heart & BP":        ["Chest pain", "Palpitations", "Shortness of breath", "Dizziness"],
  "Blood Sugar":       ["Excessive thirst", "Frequent urination", "Sudden hunger", "Blurred vision"],
  "Joints & Muscles":  ["Joint pain", "Muscle cramps", "Swelling", "Stiffness"],
  "Skin & Hair":       ["Hair loss", "Dry skin", "Rashes", "Pale skin", "Yellowing"],
  "Mental":            ["Anxiety", "Depression", "Insomnia", "Mood swings"],
};

const POSSIBLE_CONDITIONS = {
  "Constant tiredness":  ["Anaemia", "Thyroid disorder", "Diabetes", "B12 deficiency"],
  "Excessive thirst":    ["Diabetes", "Dehydration", "Kidney issue"],
  "Frequent urination":  ["Diabetes", "UTI", "Kidney issue", "Prostate (men)"],
  "Joint pain":          ["Arthritis", "Uric acid / Gout", "Vitamin D deficiency"],
  "Hair loss":           ["Thyroid disorder", "Iron/B12 deficiency", "Hormonal imbalance"],
  "Bloating":            ["IBS", "GERD", "Food intolerance", "H. pylori"],
  "Chest pain":          ["Cardiac issue", "GERD", "Anxiety — See doctor urgently"],
  "Dizziness":           ["Low BP", "Anaemia", "Inner ear issue", "Dehydration"],
  "Palpitations":        ["Thyroid disorder", "Anaemia", "Anxiety", "Caffeine excess"],
  "Blurred vision":      ["Diabetes", "High BP", "Eye strain"],
};

function SymptomChecker({ dark }) {
  const [selected, setSelected] = useState([]);
  const [showed, setShowed] = useState(false);

  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const matched = selected.flatMap(s => POSSIBLE_CONDITIONS[s] || []);
  const unique = [...new Set(matched)];

  const card     = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted    = dark ? "text-slate-400" : "text-slate-500";
  const catLabel = dark ? "text-slate-500" : "text-slate-400";
  const selBg    = dark ? "bg-blue-600 border-blue-600 text-white" : "bg-blue-600 border-blue-600 text-white";
  const defBg    = dark ? "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300";

  return (
    <div className={`rounded-xl border p-5 sm:p-6 ${card}`}>
      <div className="flex items-center justify-between gap-2.5 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${dark ? "bg-slate-800" : "bg-blue-50"}`}>🔍</div>
          <div>
            <h2 className={`font-semibold text-sm ${dark ? "text-slate-100" : "text-slate-800"}`} style={{ fontFamily:"'Sora',sans-serif" }}>Symptom Checker</h2>
            <p className={`text-xs ${muted}`}>Select symptoms to see possible conditions</p>
          </div>
        </div>
        {selected.length > 0 && (
          <button onClick={() => { setSelected([]); setShowed(false); }}
            className={`text-xs font-medium border rounded-lg px-2.5 py-1 transition-all ${dark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {Object.entries(SYMPTOM_GROUPS).map(([cat, symptoms]) => (
          <div key={cat}>
            <p className={`text-[0.65rem] font-bold uppercase tracking-wider mb-1.5 ${catLabel}`}>{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map(s => (
                <button key={s} onClick={() => toggle(s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-all duration-200 ${selected.includes(s) ? selBg : defBg}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected.length > 0 && (
        <button onClick={() => setShowed(true)}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
          Check Possible Conditions ({selected.length} symptoms)
        </button>
      )}

      {showed && unique.length > 0 && (
        <div className={`mt-4 rounded-xl border p-4 animate-fadeInUp ${dark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
          <p className={`text-xs font-bold mb-2 ${dark ? "text-amber-400" : "text-amber-700"}`}>⚠ Possible conditions to discuss with your doctor:</p>
          <div className="flex flex-wrap gap-1.5">
            {unique.map((c, i) => (
              <span key={i} className={`px-2.5 py-1 rounded text-[0.65rem] font-semibold border animate-fadeInUp
                ${dark ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : "bg-amber-100 border-amber-300 text-amber-700"}`}
                style={{ animationDelay:`${i*30}ms` }}>
                {c}
              </span>
            ))}
          </div>
          <p className={`text-[0.6rem] mt-3 ${muted}`}>
            ⚠ This is NOT a diagnosis. Consult a qualified doctor for proper evaluation and diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══ MAIN TOOLS PAGE ═══
export default function ToolsPage() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState("bmi");
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const tabBg = dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200";
  const tabActive = "bg-blue-600 text-white";
  const tabDef = dark ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/80";

  const TABS = [
    { key:"bmi",      label:"⚖️ BMI Calculator" },
    { key:"ranges",   label:"📋 Normal Ranges" },
    { key:"symptoms", label:"🔍 Symptom Checker" },
  ];

  return (
    <div className="max-w-3xl mx-auto" style={{ fontFamily:"'Inter',sans-serif" }}>
      <div className="mb-6 animate-fadeInUp">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-0.5">Medical Tools</p>
        <h1 className="font-bold text-2xl" style={{ fontFamily:"'Sora',sans-serif" }}>Health Tools</h1>
        <p className={`text-sm mt-1 ${muted}`}>Quick health calculators and reference tools</p>
      </div>

      {/* Tab nav */}
      <div className={`p-1 rounded-xl border mb-5 animate-fadeInUp delay-75 ${tabBg}`}>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${activeTab === t.key ? tabActive : tabDef}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fadeIn">
        {activeTab === "bmi"      && <BMICalculator dark={dark} />}
        {activeTab === "ranges"   && <NormalRanges dark={dark} />}
        {activeTab === "symptoms" && <SymptomChecker dark={dark} />}
      </div>

      <div className={`mt-4 flex gap-2 p-3.5 rounded-xl border text-xs ${dark ? "bg-blue-600/5 border-blue-500/15 text-blue-400/70" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
        <span>ℹ</span>
        <span>All tools here are for general awareness only. Not a substitute for professional medical advice or diagnosis.</span>
      </div>
    </div>
  );
}
