import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiHome,
  FiShield,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiSettings,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext.jsx";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // ============================================================
  // NAVIGATION ITEMS
  // ============================================================

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: FiGrid,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: FiUsers,
    },
    {
      name: "Properties",
      path: "/admin/properties",
      icon: FiHome,
    },
  ];

  // ============================================================
  // NAVIGATION LINK RENDERER
  // ============================================================

  const renderNavigation = () => (
    <nav className="space-y-1.5">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="text-lg" />
              <span>{item.name}</span>
            </div>

            <FiChevronRight className="text-sm opacity-40 transition-transform group-hover:translate-x-0.5" />
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ======================================================
            LOGO
        ====================================================== */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <FiShield className="text-xl" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Estate<span className="text-indigo-400">Lanka</span>
              </h1>

              <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">
                Admin Portal
              </p>
            </div>
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ======================================================
            USER INFORMATION
        ====================================================== */}

        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600/30 font-bold text-indigo-300 ring-2 ring-indigo-500/40">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name}
              </p>

              <p className="truncate text-xs text-slate-400">{user?.email}</p>

              <span className="mt-1 inline-block rounded-md bg-indigo-600/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Admin Menu
          </p>

          {renderNavigation()}
        </div>

        {/* ======================================================
            LOGOUT
        ====================================================== */}

        <div className="border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN AREA
      ======================================================== */}

      <div className="lg:pl-72">
        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2.5 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 lg:hidden"
            >
              <FiMenu className="text-xl" />
            </button>

            {/* Desktop title */}
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-slate-700">
                Admin Control Panel
              </p>

              <p className="text-xs text-slate-400">
                EstateLanka Platform Management
              </p>
            </div>

            {/* Right side — admin badge + avatar */}
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition hover:bg-slate-50"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-300"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-xs font-semibold text-indigo-500">
                  Administrator
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* ======================================================
            PAGE CONTENT
        ====================================================== */}

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
