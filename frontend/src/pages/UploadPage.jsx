import { useState, useContext, useRef } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const STEPS = ["Reading PDF…", "AI Analyzing…", "Building Insights…", "Saving Report…"];

export default function UploadPage() {
  const { user } = useContext(AuthContext);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const handleFileSelect = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Only PDF files are accepted."); return; }
    if (f.size > 10 * 1024 * 1024) { setError("Maximum file size is 10MB."); return; }
    setError(""); setFile(f);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); };

  const handleUpload = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    try {
      setLoading(true); setError(""); setProgress(0); setStepIdx(0);
      const formData = new FormData();
      formData.append("file", file);

      let prog = 0, sIdx = 0;
      const iv = setInterval(() => {
        prog += Math.random() * 7;
        if (prog >= 90) clearInterval(iv);
        const c = Math.min(prog, 90);
        setProgress(c);
        const ns = Math.min(Math.floor(c / 25), 3);
        if (ns !== sIdx) { sIdx = ns; setStepIdx(ns); }
      }, 450);

      const res = await API.post("/reports/upload", formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      clearInterval(iv);
      setProgress(100); setStepIdx(3);
      setTimeout(() => navigate(`/report/${res.data._id}`), 700);
    } catch (err) {
      setLoading(false); setProgress(0); setStepIdx(0);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  const fmtSize = (b) => b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/(1024*1024)).toFixed(1)} MB`;

  const card  = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const sub   = dark ? "text-slate-600" : "text-slate-400";
  const dz    = dark
    ? `border-slate-700 ${dragOver ? "border-blue-500 bg-blue-600/5" : "hover:border-slate-600"}`
    : `border-slate-300 ${dragOver ? "border-blue-500 bg-blue-50" : "hover:border-slate-400"}`;
  const tagBg = dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600";

  return (
    <div className="max-w-xl mx-auto" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div className="mb-6 animate-fadeInUp">
        <p className={`text-xs font-semibold uppercase tracking-widest mb-1 text-blue-500`}>AI Analysis</p>
        <h1 className="font-bold text-2xl sm:text-3xl mb-1.5" style={{ fontFamily:"'Sora',sans-serif" }}>Upload Health Report</h1>
        <p className={`text-sm ${muted}`}>Upload a lab PDF and Dr. MedVision AI will explain every value clearly.</p>
      </div>

      {/* Tip */}
      <div className={`flex gap-3 p-3.5 rounded-xl border mb-5 animate-fadeInUp delay-75
        ${dark ? "bg-blue-600/8 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
        <span className={`text-sm shrink-0 mt-0.5 ${dark ? "text-blue-400" : "text-blue-500"}`}>ℹ</span>
        <p className={`text-xs leading-relaxed ${dark ? "text-blue-300/80" : "text-blue-700"}`}>
          Works best with text-based PDFs: blood tests, CBC, lipid panel, thyroid, liver/kidney function reports.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone border-2 border-dashed rounded-xl mb-5 animate-fadeInUp delay-100 transition-all duration-200 ${dz}`}
        onClick={() => !file && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])} />

        {!file ? (
          <div className="flex flex-col items-center text-center p-10 sm:p-14">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>📄</div>
            <h3 className={`font-semibold text-sm mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>Drop your PDF here</h3>
            <p className={`text-xs mb-4 ${muted}`}>or click to browse</p>
            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
              {["Blood Test", "CBC", "Lipid Panel", "Thyroid", "Kidney"].map(t => (
                <span key={t} className={`px-2.5 py-1 rounded text-[0.65rem] font-medium border ${tagBg}`}>{t}</span>
              ))}
            </div>
            <p className={`text-[0.65rem] ${sub}`}>PDF only · Max 10MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center p-7">
            <div className={`w-full max-w-xs flex items-center gap-3 p-3.5 rounded-xl border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${dark ? "bg-slate-700" : "bg-blue-50"}`}>📄</div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm font-medium truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>{file.name}</p>
                <p className={`text-[0.65rem] ${sub}`}>{fmtSize(file.size)} · PDF</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className={`shrink-0 px-2.5 py-1 rounded text-xs font-medium border transition-all duration-200
                  ${dark ? "border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/35" : "border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"}`}>
                Remove
              </button>
            </div>
            <p className={`text-xs mt-2.5 ${sub}`}>Click to change file</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={`flex items-start gap-2 p-3.5 rounded-lg border text-xs mb-4 animate-slideInLeft
          ${dark ? "bg-red-500/10 border-red-500/25 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}>
          ⚠️ {error}
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className={`rounded-xl border p-5 mb-4 animate-scaleIn ${card}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full spinner shrink-0" />
            <span className={`text-sm font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>{STEPS[stepIdx]}</span>
            <span className={`ml-auto text-xs font-mono font-semibold ${muted}`}>{Math.round(progress)}%</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className="h-full rounded-full bg-blue-600 meter-fill" style={{ width:`${progress}%` }} />
          </div>
          <div className="flex gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-400 ${i <= stepIdx ? "bg-blue-600 flex-1" : `w-3 ${dark ? "bg-slate-700" : "bg-slate-200"}`}`} />
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {!loading && (
        <button onClick={handleUpload} disabled={!file}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
          Analyze with AI
        </button>
      )}

      {/* Privacy note */}
      <div className={`flex items-start gap-2.5 p-3.5 rounded-lg mt-4 border animate-fadeInUp delay-200
        ${dark ? "bg-emerald-500/5 border-emerald-500/15" : "bg-emerald-50 border-emerald-200"}`}>
        <span className={`text-sm shrink-0 ${dark ? "text-emerald-400" : "text-emerald-600"}`}>🔒</span>
        <p className={`text-xs leading-relaxed ${dark ? "text-emerald-400/70" : "text-emerald-700"}`}>
          Files are deleted immediately after analysis. Only encrypted results are stored.
        </p>
      </div>
    </div>
  );
}
