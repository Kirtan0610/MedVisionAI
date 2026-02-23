import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AVATAR_COLORS = ["#2563EB","#7C3AED","#0891B2","#059669","#DC2626","#D97706","#DB2777","#4F46E5"];

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Edit profile state
  const [editForm, setEditForm] = useState({ name:"", phone:"", bio:"", language:"en", avatarColor:"#2563EB" });
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text:"", ok:true });

  // Delete account state
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    Promise.all([
      API.get("/users/me", { headers:{ Authorization:`Bearer ${user.token}` } }),
      API.get("/reports",  { headers:{ Authorization:`Bearer ${user.token}` } }),
    ]).then(([u,r]) => {
      setProfile(u.data);
      setReports(r.data);
      setEditForm({ name:u.data.name||"", phone:u.data.phone||"", bio:u.data.bio||"", language:u.data.language||"en", avatarColor:u.data.avatarColor||"#2563EB" });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const riskC = { Low:0, Medium:0, High:0 };
  reports.forEach(r => { try { const p = JSON.parse(r.aiResult); if (riskC[p.riskLevel]!==undefined) riskC[p.riskLevel]++; } catch {} });

  const saveProfile = async () => {
    setEditSaving(true); setEditMsg("");
    try {
      const res = await API.put("/users/me", editForm, { headers:{ Authorization:`Bearer ${user.token}` } });
      setProfile(res.data);
      setEditMsg("✓ Profile updated successfully!");
    } catch { setEditMsg("Failed to update. Try again."); }
    finally { setEditSaving(false); }
  };

  const changePassword = async () => {
    setPwMsg({ text:"", ok:true });
    if (!pwForm.currentPassword || !pwForm.newPassword) { setPwMsg({ text:"Fill all fields", ok:false }); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg({ text:"New passwords don't match", ok:false }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ text:"Min 6 characters required", ok:false }); return; }
    setPwSaving(true);
    try {
      await API.put("/users/change-password", { currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword }, { headers:{ Authorization:`Bearer ${user.token}` } });
      setPwMsg({ text:"✓ Password changed successfully!", ok:true });
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || "Failed to change password", ok:false });
    } finally { setPwSaving(false); }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await API.delete("/users/delete", { headers:{ Authorization:`Bearer ${user.token}` } });
      logout();
      navigate("/");
    } catch { setDeleting(false); }
  };

  const card    = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const muted   = dark ? "text-slate-400" : "text-slate-500";
  const label   = dark ? "text-slate-400" : "text-slate-500";
  const sub     = dark ? "text-slate-600" : "text-slate-400";
  const input   = dark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-300 text-slate-900 focus:border-blue-500";
  const tabWrap = dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200";
  const tabAct  = "bg-blue-600 text-white";
  const tabDef  = dark ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100";
  const rowHov  = dark ? "border-slate-800 bg-slate-800/30 hover:bg-slate-800" : "border-slate-100 bg-slate-50 hover:border-slate-200";

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-3">
      {[140,80,90,110].map((h,i) => <div key={i} className="skeleton rounded-xl" style={{ height:h }} />)}
    </div>
  );

  const initial  = profile?.name?.charAt(0)?.toUpperCase() || "U";
  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "";

  const TABS = [
    { key:"profile",  label:"Edit Profile" },
    { key:"security", label:"Security" },
    { key:"activity", label:"Activity" },
    { key:"danger",   label:"Danger Zone" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4" style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Header card */}
      <div className={`rounded-xl border p-5 sm:p-6 animate-fadeInUp ${card}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ background: profile?.avatarColor || "#2563EB" }}>
            {initial}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className={`font-bold text-xl mb-0.5 ${dark ? "text-slate-100" : "text-slate-800"}`}>{profile?.name}</h2>
            <p className={`text-sm mb-1 ${muted}`}>{profile?.email}</p>
            {profile?.bio && <p className={`text-xs italic ${muted}`}>"{profile.bio}"</p>}
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2">
              <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded border ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>✓ Verified</span>
              <span className={`text-[0.65rem] font-medium px-2 py-0.5 rounded border ${dark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"}`}>Member since {joinDate}</span>
              {profile?.language === "hi" && <span className="text-[0.65rem] font-medium px-2 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400">हिंदी Mode</span>}
            </div>
          </div>
          {/* Stats inline */}
          <div className={`flex gap-4 sm:flex-col sm:gap-1 shrink-0 text-center sm:text-right`}>
            <div><p className={`font-bold text-xl text-blue-500`} style={{ fontFamily:"'Sora',sans-serif" }}>{reports.length}</p><p className={`text-[0.65rem] ${muted}`}>Reports</p></div>
            <div><p className="font-bold text-xl text-emerald-500" style={{ fontFamily:"'Sora',sans-serif" }}>{riskC.Low}</p><p className={`text-[0.65rem] ${muted}`}>Low Risk</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`p-1 rounded-xl border ${tabWrap}`}>
        <div className="flex overflow-x-auto gap-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${activeTab === t.key ? (t.key === "danger" ? "bg-red-600 text-white" : tabAct) : tabDef}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Edit Profile Tab ── */}
      {activeTab === "profile" && (
        <div className={`rounded-xl border p-5 sm:p-6 animate-fadeIn ${card}`}>
          <h2 className={`font-semibold text-sm mb-5 ${dark ? "text-slate-300" : "text-slate-700"}`} style={{ fontFamily:"'Sora',sans-serif" }}>Personal Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Full Name</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name:e.target.value})}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${input}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>Phone Number</label>
                <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone:e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${input}`} />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Bio (optional)</label>
              <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio:e.target.value})}
                rows={2} placeholder="A short note about yourself"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all resize-none ${input}`} />
            </div>

            {/* Avatar color */}
            <div>
              <label className={`block text-xs font-medium mb-2 ${label}`}>Avatar Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map(c => (
                  <button key={c} onClick={() => setEditForm({...editForm, avatarColor:c})}
                    className={`w-8 h-8 rounded-lg transition-all duration-200 ${editForm.avatarColor === c ? "scale-110 ring-2 ring-offset-2 ring-blue-500" : "hover:scale-105"}`}
                    style={{ background:c, ringOffsetColor: dark ? "#0f172a" : "#f8fafc" }} />
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${label}`}>Preferred AI Language</label>
              <div className={`flex rounded-lg border overflow-hidden text-sm font-semibold w-fit ${dark ? "border-slate-700" : "border-slate-200"}`}>
                {[["en","English"],["hi","हिंदी"]].map(([val,txt]) => (
                  <button key={val} onClick={() => setEditForm({...editForm, language:val})}
                    className={`px-5 py-2.5 transition-all ${editForm.language === val ? "bg-blue-600 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-600"}`}>
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {editMsg && (
              <p className={`text-xs font-medium ${editMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{editMsg}</p>
            )}

            <button onClick={saveProfile} disabled={editSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50">
              {editSaving ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner" />Saving…</> : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === "security" && (
        <div className={`rounded-xl border p-5 sm:p-6 animate-fadeIn ${card}`}>
          <h2 className={`font-semibold text-sm mb-5 ${dark ? "text-slate-300" : "text-slate-700"}`} style={{ fontFamily:"'Sora',sans-serif" }}>Change Password</h2>
          <div className="space-y-4">
            {[
              { key:"currentPassword", label:"Current Password", placeholder:"Enter current password" },
              { key:"newPassword",     label:"New Password",     placeholder:"Min 6 characters" },
              { key:"confirmPassword", label:"Confirm New Password", placeholder:"Repeat new password" },
            ].map(f => (
              <div key={f.key}>
                <label className={`block text-xs font-medium mb-1.5 ${label}`}>{f.label}</label>
                <input type="password" value={pwForm[f.key]} placeholder={f.placeholder}
                  onChange={e => setPwForm({...pwForm, [f.key]:e.target.value})}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 focus:ring-blue-500/20 transition-all ${input}`} />
              </div>
            ))}

            {pwMsg.text && (
              <p className={`text-xs font-medium ${pwMsg.ok ? "text-emerald-400" : "text-red-400"}`}>{pwMsg.text}</p>
            )}

            <button onClick={changePassword} disabled={pwSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50">
              {pwSaving ? <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spinner" />Updating…</> : "Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* ── Activity Tab ── */}
      {activeTab === "activity" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Stats grid */}
          <div className={`grid grid-cols-4 divide-x ${dark ? "divide-slate-800" : "divide-slate-100"} rounded-xl border overflow-hidden ${card}`}>
            {[
              { l:"Total",  v:reports.length, c:"text-blue-500" },
              { l:"Low",    v:riskC.Low,      c:"text-emerald-500" },
              { l:"Medium", v:riskC.Medium,   c:"text-amber-500" },
              { l:"High",   v:riskC.High,     c:"text-red-500" },
            ].map((s,i) => (
              <div key={i} className="py-4 text-center">
                <p className={`font-bold text-xl ${s.c}`} style={{ fontFamily:"'Sora',sans-serif" }}>{s.v}</p>
                <p className={`text-[0.65rem] ${muted}`}>{s.l}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-semibold text-sm ${dark ? "text-slate-300" : "text-slate-700"}`} style={{ fontFamily:"'Sora',sans-serif" }}>Health Timeline</h2>
              <Link to="/reports" className="text-xs font-medium text-blue-500 hover:text-blue-400">View all →</Link>
            </div>
            {reports.length === 0 ? (
              <p className={`text-sm text-center py-8 ${muted}`}>No reports yet. <Link to="/upload" className="text-blue-500">Upload one →</Link></p>
            ) : (
              <div className="relative">
                <div className={`absolute left-3.5 top-0 bottom-0 w-px ${dark ? "bg-slate-800" : "bg-slate-200"}`} />
                <div className="space-y-4 pl-10">
                  {reports.slice(0,8).map((r,i) => {
                    let parsed = null; try { parsed = JSON.parse(r.aiResult); } catch {}
                    const risk = parsed?.riskLevel;
                    const rColor = risk === "High" ? "#ef4444" : risk === "Medium" ? "#f59e0b" : "#10b981";
                    return (
                      <div key={r._id} className="relative animate-slideInLeft" style={{ animationDelay:`${i*50}ms` }}>
                        <div className="absolute -left-[1.625rem] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900"
                          style={{ background: rColor, boxShadow:`0 0 0 2px ${dark ? "#0f172a" : "#f8fafc"}` }} />
                        <Link to={`/report/${r._id}`} className={`block p-3 rounded-lg border transition-all duration-200 ${rowHov}`}>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium truncate max-w-[200px] ${dark ? "text-slate-300" : "text-slate-700"}`}>{r.originalFileName}</p>
                            {risk && <span className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded shrink-0"
                              style={{ color:rColor, background:`${rColor}18`, border:`1px solid ${rColor}30` }}>{risk}</span>}
                          </div>
                          <p className={`text-xs mt-0.5 ${sub}`}>{new Date(r.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Danger Zone Tab ── */}
      {activeTab === "danger" && (
        <div className={`rounded-xl border border-red-500/25 p-5 sm:p-6 animate-fadeIn ${dark ? "bg-red-500/5" : "bg-red-50"}`}>
          <h2 className="font-semibold text-sm text-red-500 mb-2" style={{ fontFamily:"'Sora',sans-serif" }}>Delete Account</h2>
          <p className={`text-xs leading-relaxed mb-5 ${muted}`}>
            This will permanently delete your account and all associated medical reports. This action cannot be undone.
          </p>
          <button onClick={() => setShowDelete(true)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200">
            Delete My Account
          </button>

          {/* Privacy info */}
          <div className="mt-5 space-y-2">
            {["Your medical data is end-to-end encrypted","PDFs deleted immediately after analysis","Only you can access your reports"].map((t,i) => (
              <div key={i} className={`flex gap-2.5 items-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
                <span className="text-emerald-400 font-bold shrink-0">✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap gap-2.5 animate-fadeInUp delay-300">
        <Link to="/upload" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200">
          + Analyze Report
        </Link>
        <button onClick={() => { logout(); navigate("/login"); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border transition-all duration-200
            ${dark ? "border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15" : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}>
          Sign Out
        </button>
      </div>

      {/* Delete modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowDelete(false)}>
          <div className={`w-full max-w-xs rounded-2xl border p-6 animate-scaleIn ${card}`} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <p className="text-3xl mb-3">⚠️</p>
              <h2 className="font-bold text-base text-red-400 mb-2">Delete Everything?</h2>
              <p className={`text-xs leading-relaxed ${muted}`}>Your account, all reports, and all AI analyses will be permanently deleted. This cannot be undone.</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDelete(false)} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold border ${dark ? "border-slate-700 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Cancel</button>
              <button onClick={deleteAccount} disabled={deleting} className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {deleting ? <><span className="w-3.5 h-3.5 border-2 border-white/25 border-t-white rounded-full spinner" />Deleting…</> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
