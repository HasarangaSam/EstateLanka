import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiHeart,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiMapPin,
  FiBarChart2,
} from "react-icons/fi";

import logo from "../../assets/logo.png";

import { useAuth } from "../../context/AuthContext";
import { useCompare } from "../../context/CompareContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { compareCount } = useCompare();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    closeMobileMenu();

    await logout();

    navigate("/");
  };

  const desktopNavClass = ({ isActive }) =>
    `relative px-3.5 py-2 text-sm font-semibold font-heading tracking-wide transition-colors duration-200 ${
      isActive
        ? "text-blue-700 font-bold"
        : "text-slate-600 hover:text-blue-700"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold font-heading transition-colors duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link
            to="/"
            onClick={handleNavClick}
            className="group flex shrink-0 items-center gap-3"
          >
            <img
              src={logo}
              alt="EstateLanka"
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />

            <div className="leading-none">
              <div className="font-heading text-[22px] font-extrabold tracking-tight">
                <span className="text-slate-900">Estate</span>
                <span className="text-blue-600">Lanka</span>
              </div>

              <p className="mt-1 hidden text-[10px] font-bold tracking-[0.14em] text-slate-400 sm:block">
                FIND YOUR PLACE
              </p>
            </div>
          </Link>

          <div className="hidden items-center lg:flex">
            <div className="flex items-center gap-1">
              <NavLink
                to="/"
                onClick={handleNavClick}
                className={desktopNavClass}
              >
                {({ isActive }) => (
                  <>
                    Home
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>

              <NavLink
                to="/about"
                onClick={handleNavClick}
                className={desktopNavClass}
              >
                {({ isActive }) => (
                  <>
                    About
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>

              <NavLink
                to="/properties"
                onClick={handleNavClick}
                className={desktopNavClass}
              >
                {({ isActive }) => (
                  <>
                    Properties
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>

              {user?.role === "buyer" && (
                <NavLink
                  to="/favourites"
                  onClick={handleNavClick}
                  className={desktopNavClass}
                >
                  {({ isActive }) => (
                    <>
                      Favourites
                      <span
                        className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              )}

              <NavLink
                to="/compare"
                onClick={handleNavClick}
                className={desktopNavClass}
              >
                {({ isActive }) => (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      Compare
                      {compareCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                          {compareCount}
                        </span>
                      )}
                    </span>

                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>

              <NavLink
                to="/contact"
                onClick={handleNavClick}
                className={desktopNavClass}
              >
                {({ isActive }) => (
                  <>
                    Contact Us
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform duration-200 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:text-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={user.role === "seller" ? "/seller/profile" : "/profile"}
                  onClick={handleNavClick}
                  className="group flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/50"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <FiUser className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0 leading-tight">
                    <p className="max-w-[110px] truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                      {user.name}
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium capitalize text-slate-400">
                      {user.role}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                >
                  <FiLogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
          >
            {mobileMenuOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "max-h-[700px] border-t border-slate-100 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-5 pt-3">
            <div className="space-y-1">
              <NavLink
                to="/"
                onClick={handleNavClick}
                className={mobileNavClass}
              >
                <FiHome className="h-[18px] w-[18px]" />
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/properties"
                onClick={handleNavClick}
                className={mobileNavClass}
              >
                <FiMapPin className="h-[18px] w-[18px]" />
                <span>Properties</span>
              </NavLink>

              <NavLink
                to="/about"
                onClick={handleNavClick}
                className={mobileNavClass}
              >
                <FiHome className="h-[18px] w-[18px]" />
                <span>About</span>
              </NavLink>

              <NavLink
                to="/compare"
                onClick={handleNavClick}
                className={mobileNavClass}
              >
                <FiBarChart2 className="h-[18px] w-[18px]" />

                <span className="flex items-center gap-2">
                  Compare
                  {compareCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                      {compareCount}
                    </span>
                  )}
                </span>
              </NavLink>

              <NavLink
                to="/contact"
                onClick={handleNavClick}
                className={mobileNavClass}
              >
                <FiUser className="h-[18px] w-[18px]" />
                <span>Contact Us</span>
              </NavLink>

              {user?.role === "buyer" && (
                <NavLink
                  to="/favourites"
                  onClick={handleNavClick}
                  className={mobileNavClass}
                >
                  <FiHeart className="h-[18px] w-[18px]" />
                  <span>Favourites</span>
                </NavLink>
              )}
            </div>

            <div className="my-4 border-t border-slate-100" />

            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
                >
                  Create Account
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to={user.role === "seller" ? "/seller/profile" : "/profile"}
                  onClick={handleNavClick}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FiUser className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {user.name}
                    </p>

                    <p className="mt-0.5 text-xs font-medium capitalize text-slate-500">
                      {user.role}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors duration-200 hover:bg-red-100"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
