import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiDollarSign,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext.jsx";

const SellerLayout = () => {
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
      path: "/seller",
      icon: FiGrid,
    },
    {
      name: "My Properties",
      path: "/seller/properties",
      icon: FiHome,
    },
    {
      name: "Inquiries",
      path: "/seller/inquiries",
      icon: FiMessageSquare,
    },
    {
      name: "Price Predictor",
      path: "/seller/price-predictor",
      icon: FiDollarSign,
    },
    {
      name: "My Profile",
      path: "/seller/profile",
      icon: FiUser,
    },
  ];

  // ============================================================
  // NAVIGATION LINK
  // ============================================================

  const renderNavigation = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/seller"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="text-lg" />

              <span>{item.name}</span>
            </div>

            <FiChevronRight className="text-sm opacity-50 transition-transform group-hover:translate-x-1" />
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ======================================================
            LOGO
        ====================================================== */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <FiHome className="text-xl" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Estate<span className="text-blue-600">Lanka</span>
              </h1>

              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Seller Portal
              </p>
            </div>
          </button>

          {/* Mobile close button */}

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ======================================================
            USER INFORMATION
        ====================================================== */}

        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name}
              </p>

              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Seller Menu
          </p>

          {renderNavigation()}
        </div>

        {/* ======================================================
            LOGOUT
        ====================================================== */}

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
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
            MOBILE / TOP HEADER
        ====================================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2.5 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 lg:hidden"
            >
              <FiMenu className="text-xl" />
            </button>

            {/* Desktop title */}

            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-500">
                Seller Dashboard
              </p>

              <p className="text-xs text-slate-400">
                Manage your properties and listings
              </p>
            </div>

            {/* Right side */}

            <button
              onClick={() => navigate("/seller/profile")}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div className="hidden text-left sm:block">
                <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-xs capitalize text-slate-400">
                  {user?.role}
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

export default SellerLayout;
