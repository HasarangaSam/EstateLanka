import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiX,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import logo from "../../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const avatarInputRef = useRef(null);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "seller") navigate("/seller", { replace: true });
      else if (user.role === "admin")
        navigate("/admin/dashboard", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "buyer",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image size must be less than 5 MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) return setError("Please enter your name.");
    if (!formData.email.trim())
      return setError("Please enter your email address.");
    if (!formData.phone.trim())
      return setError("Please enter your phone number.");
    if (!formData.password || formData.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("phone", formData.phone.trim());
      data.append("password", formData.password);
      data.append("role", formData.role);

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        body: data,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Registration failed.");
      }

      // Navigate to OTP verification page
      navigate(
        `/verify-otp?email=${encodeURIComponent(formData.email.trim())}`,
      );
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
        {/* Left Info Panel */}
        <div className="hidden bg-blue-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <img
              src={logo}
              alt="EstateLanka"
              className="mb-8 h-18 w-18 object-contain"
            />

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-100">
              Join EstateLanka
            </p>

            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Start Your Real Estate Journey Today.
            </h1>

            <p className="mt-5 max-w-md leading-7 text-blue-100">
              Create an account to browse properties, save favourites as a
              Buyer, or list houses and apartments as a Seller across Sri Lanka.
            </p>
          </div>

          <div className="border-t border-blue-500 pt-6 text-sm text-blue-100">
            Direct owner contact &bull; Zero commission fees.
          </div>
        </div>

        {/* Form Panel */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Create an Account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your information to register on EstateLanka.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                <FiAlertCircle className="shrink-0 text-base" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Profile Avatar (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-blue-600 shadow-sm">
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute right-0 top-0 rounded-full bg-slate-900/70 p-1 text-white hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => avatarInputRef.current?.click()}
                      className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600"
                    >
                      <FiUpload size={20} />
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </button>
                    <p className="mt-1 text-[11px] text-slate-400">
                      PNG, JPG or WEBP up to 5MB
                    </p>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "buyer" }))
                    }
                    className={`rounded-xl border py-3 px-4 text-xs font-bold transition ${
                      formData.role === "buyer"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Buyer Account
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: "seller" }))
                    }
                    className={`rounded-xl border py-3 px-4 text-xs font-bold transition ${
                      formData.role === "seller"
                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Seller Account
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ruwan Silva"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ruwan@example.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <FiPhone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="077 123 4567"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Password * (Min 8 characters)
                </label>
                <div className="relative">
                  <FiLock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={15}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
