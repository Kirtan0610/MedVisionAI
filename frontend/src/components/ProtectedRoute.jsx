import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { dark } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-3 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
        <div className="w-8 h-8 border-2 border-blue-600/25 border-t-blue-600 rounded-full spinner" />
        <p className={`text-xs font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}>Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return children;
}
