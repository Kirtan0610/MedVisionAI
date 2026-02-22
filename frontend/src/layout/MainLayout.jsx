import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MainLayout() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded-lg transition ${
        location.pathname === path
          ? "bg-[#FA8072] text-white"
          : "text-gray-700 hover:bg-[#FFF5F4]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-[#FFF5F4]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-5">
        <h2 className="text-xl font-bold text-[#FA8072] mb-6">Med Vision AI</h2>

        <div className="space-y-2">
          {navItem("/dashboard", "Dashboard")}
          {navItem("/upload", "Upload Report")}
          {navItem("/reports", "Report History")}
          {navItem("/profile", "Profile")}
        </div>

        <button
          onClick={logout}
          className="mt-10 text-sm text-gray-500 hover:text-[#FA8072]"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
