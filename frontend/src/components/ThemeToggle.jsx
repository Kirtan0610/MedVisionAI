import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold
        transition-all duration-200 cursor-pointer select-none
        ${dark
          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
        }
        ${className}
      `}
    >
      <span className="text-sm leading-none">{dark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline tracking-wide">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}
