import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import logo from "../../assets/logo.png";

const Login = () => {
  const { user, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // If user is already logged in, redirect to their role dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "seller") {
        navigate("/seller", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ============================================================
  // HANDLE LOGIN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData.email, formData.password);

      // Determine post-login destination based on role
      let destination = location.state?.from?.pathname;

      if (!destination || destination === "/") {
        if (data.user?.role === "seller") {
          destination = "/seller";
        } else if (data.user?.role === "admin") {
          destination = "/admin/dashboard";
        } else {
          destination = "/";
        }
      }

      navigate(destination, { replace: true });
    } catch (error) {
      setError(error.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
        {/* ================================================== */}
        {/* LEFT SIDE */}
        {/* ================================================== */}

        <div className="hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <img
              src={logo}
              alt="EstateLanka"
              className="mb-8 h-18 w-18 object-contain"
            />

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-100">
              Welcome back
            </p>

            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Find a place that feels like home.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-blue-100">
              Sign in to explore properties, save your favourites, contact
              sellers, and manage your EstateLanka account.
            </p>
          </div>

          <div className="border-t border-blue-500 pt-6 text-sm text-blue-100">
            Trusted property discovery for Sri Lanka.
          </div>
        </div>

        {/* ================================================== */}
        {/* LOGIN FORM */}
        {/* ================================================== */}

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            {/* Mobile heading */}
            <div className="mb-8 lg:hidden">
              <img
                src={logo}
                alt="EstateLanka"
                className="mb-5 h-11 w-11 object-contain"
              />

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                EstateLanka
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your account.
              </p>
            </div>

            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 hover:shadow-blue-700/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* REGISTER */}

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
