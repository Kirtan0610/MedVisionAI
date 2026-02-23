import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const NAV = [
  { path:"/dashboard", label:"Dashboard",      icon:"⊞" },
  { path:"/upload",    label:"Analyze Report", icon:"⊕" },
  { path:"/reports",   label:"My Reports",     icon:"≡" },
  { path:"/chat",      label:"Ask Dr. AI",     icon:"◈" },
  { path:"/tools",     label:"Health Tools",   icon:"⚙" },
  { path:"/profile",   label:"Profile",        icon:"◎" },
];

export default function MainLayout() {
  const { logout, user } = useContext(AuthContext);
  const { dark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const avatarColor = "#2563EB";

  const bg        = dark ? "bg-slate-950"   : "bg-slate-50";
  const sidebar   = dark ? "bg-slate-900 border-slate-800"   : "bg-white border-slate-200";
  const topbar    = dark ? "bg-slate-900 border-slate-800"   : "bg-white border-slate-200";
  const navBase   = dark ? "text-slate-400 hover:text-white hover:bg-slate-800"  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100";
  const navActive = "bg-blue-600 text-white";
  const divider   = dark ? "border-slate-800" : "border-slate-200";
  const muted     = dark ? "text-slate-500"   : "text-slate-400";

  return (
    <div className={`flex min-h-screen ${bg} transition-colors duration-300`} style={{ fontFamily:"'Inter',sans-serif" }}>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fadeIn" onClick={() => setOpen(false)} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r ${sidebar}
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static
      `}>
        {/* Brand */}
        <div className={`flex items-center gap-3 px-5 h-16 border-b ${divider} shrink-0`}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">M</div>
          <div>
            <p className={`font-semibold text-sm tracking-tight ${dark ? "text-white" : "text-slate-800"}`} style={{ fontFamily:"'Sora',sans-serif" }}>MedVision</p>
            <p className={`text-[0.6rem] uppercase tracking-widest font-semibold ${muted}`}>AI Health</p>
          </div>
          <button onClick={() => setOpen(false)} className={`ml-auto lg:hidden p-1 rounded ${muted} hover:text-white`}>✕</button>
        </div>

        {/* User chip */}
        <div className={`mx-3 mt-4 p-3 rounded-xl border ${dark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">{initial}</div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>{user?.name || "User"}</p>
              <p className={`text-[0.65rem] font-medium ${muted}`}>Patient Account</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className={`text-[0.6rem] font-bold uppercase tracking-widest px-2 mb-2 ${muted}`}>Menu</p>
          {NAV.map(({ path, label, icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${active ? navActive : navBase}`}>
                <span className="text-base w-5 text-center shrink-0 font-mono">{icon}</span>
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className={`p-3 border-t ${divider} space-y-2`}>
          <ThemeToggle className="w-full justify-center" />
          <button onClick={() => { logout(); navigate("/login"); }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-all duration-150
              ${dark ? "border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5"
                     : "border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50"}`}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className={`lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b ${topbar}`}>
          <button onClick={() => setOpen(true)}
            className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
            <svg className={`w-5 h-5 ${dark ? "text-slate-400" : "text-slate-600"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-800"}`} style={{ fontFamily:"'Sora',sans-serif" }}>MedVision AI</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
