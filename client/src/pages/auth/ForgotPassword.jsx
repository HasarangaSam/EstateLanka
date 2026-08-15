import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiMail, FiCheckCircle } from "react-icons/fi";

import logo from "../../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process your request.");
      }

      setSuccess(data.message);

      setEmail("");
    } catch (error) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
          {/* LOGO */}

          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="EstateLanka"
              className="mx-auto mb-5 h-14 w-14 object-contain"
            />

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Forgot your password?
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Enter the email address associated with your EstateLanka account
              and we'll send you a password reset link.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
              <FiCheckCircle className="mt-0.5 shrink-0 text-lg" />

              <p className="leading-6">{success}</p>
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
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
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
                  Sending link...
                </>
              ) : (
                <>
                  Send reset link
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* BACK TO LOGIN */}

          <p className="mt-8 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
