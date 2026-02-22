import { Link, Outlet, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

function MainLayout() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItem = (path, label) => (
    <Link
      to={path}
      onClick={() => setOpen(false)}
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
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-white shadow-md p-5 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block`}
      >
        {/* Close button (mobile) */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold text-[#FA8072]">Med Vision AI</h2>
          <button onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="hidden md:block text-xl font-bold text-[#FA8072] mb-6">
          Med Vision AI
        </h2>

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
      <div className="flex-1 flex flex-col">
        {/* Top Bar (mobile only) */}
        <div className="md:hidden bg-white shadow px-4 py-3 flex items-center">
          <button onClick={() => setOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="ml-4 font-semibold text-[#FA8072]">Med Vision AI</h2>
        </div>

        <div className="flex-1 p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
