import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiPhone,
  FiHome,
  FiArrowUpRight,
  FiTwitter,
  FiLinkedin,
  FiYoutube,
} from "react-icons/fi";

import logo from "../../assets/logo.png";

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* =====================================================
              BRAND
          ====================================================== */}

          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-3">
              {/* Logo image */}
              <img
                src={logo}
                alt="EstateLanka"
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              />

              {/* Logo Text */}
              <div className="leading-none">
                <span className="font-heading text-xl font-extrabold tracking-tight text-white">
                  Estate<span className="text-blue-400">Lanka</span>
                </span>

                <p className="mt-1 text-[9px] font-bold tracking-[0.14em] text-slate-500">
                  FIND YOUR PLACE
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              A simple and trusted way to discover houses and apartments for
              sale and rent across Sri Lanka.
            </p>

            {/* Social Icons */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                aria-label="Facebook"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-800
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-blue-600
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FiFacebook className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Instagram"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-800
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-blue-600
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FiInstagram className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="Twitter"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-800
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-blue-600
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FiTwitter className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="LinkedIn"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-800
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-blue-600
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FiLinkedin className="h-4 w-4" />
              </button>

              <button
                type="button"
                aria-label="YouTube"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-lg
                  border border-slate-800
                  bg-slate-900
                  text-slate-400
                  transition-all duration-200
                  hover:border-blue-600
                  hover:bg-blue-600
                  hover:text-white
                "
              >
                <FiYoutube className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* =====================================================
              EXPLORE
          ====================================================== */}

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Explore
            </h3>

            <div className="mt-3 h-0.5 w-7 rounded-full bg-blue-600" />

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/properties"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Properties
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/favourites"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Favourites
                </Link>
              </li>
            </ul>
          </div>

          {/* =====================================================
              ACCOUNT
          ====================================================== */}

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Account
            </h3>

            <div className="mt-3 h-0.5 w-7 rounded-full bg-blue-600" />

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/login"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  Create Account
                  <FiArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>

              <li>
                <Link
                  to="/profile"
                  className="
                    inline-flex items-center gap-1
                    text-slate-400
                    transition-colors duration-200
                    hover:text-blue-400
                  "
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* =====================================================
              CONTACT
          ====================================================== */}

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">
              Contact
            </h3>

            <div className="mt-3 h-0.5 w-7 rounded-full bg-blue-600" />

            <div className="mt-5 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <FiMail className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>

                  <p className="mt-1 text-sm text-slate-300">
                    support@estatelanka.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <FiPhone className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500">Phone</p>

                  <p className="mt-1 text-sm text-slate-300">+94 11 234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM FOOTER
        ====================================================== */}

        <div
          className="
            flex flex-col gap-4
            border-t border-slate-800
            py-6
            text-xs text-slate-500
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <p>© {new Date().getFullYear()} EstateLanka. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              className="
                transition-colors duration-200
                hover:text-slate-300
              "
            >
              Privacy Policy
            </button>

            <button
              type="button"
              className="
                transition-colors duration-200
                hover:text-slate-300
              "
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
