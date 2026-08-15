import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get("email") ||
    "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // ============================================================
  // REDIRECT IF EMAIL IS MISSING
  // ============================================================

  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // ============================================================
  // RESEND COUNTDOWN
  // ============================================================

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ============================================================
  // HANDLE OTP INPUT
  // ============================================================

  const handleOtpChange = (index, value) => {
    // Only allow numbers.
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setOtp((previous) => {
        const updated = [...previous];
        updated[index] = "";
        return updated;
      });

      return;
    }

    setOtp((previous) => {
      const updated = [...previous];
      updated[index] = numericValue.slice(-1);
      return updated;
    });

    setError("");
    setSuccess("");

    // Move to the next input.
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // ============================================================
  // HANDLE BACKSPACE
  // ============================================================

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ============================================================
  // HANDLE OTP PASTE
  // ============================================================

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updatedOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((number, index) => {
      updatedOtp[index] = number;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(pastedValue.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess("Email verified successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1500);
    } catch (error) {
      setError(error.message || "Unable to verify the OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      const response = await fetch(`${API_URL}/auth/resend-otp`, {
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
        throw new Error(data.message || "Unable to resend OTP");
      }

      setSuccess("A new verification code has been sent to your email.");

      setOtp(["", "", "", "", "", ""]);

      setResendCooldown(60);

      inputRefs.current[0]?.focus();
    } catch (error) {
      setError(error.message || "Unable to resend the verification code.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-140px)] bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
          {/* ICON */}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <FiMail className="text-3xl" />
          </div>

          {/* HEADING */}

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Email verification
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Verify your email
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              We've sent a 6-digit verification code to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-800">
              {email}
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-7 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              <FiCheckCircle className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="mt-8">
            <div
              className="flex justify-center gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(event) =>
                    handleOtpChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className="h-12 w-11 rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:h-14 sm:w-14"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* VERIFY BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify email
                  <FiCheckCircle />
                </>
              )}
            </button>
          </form>

          {/* RESEND */}

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500">Didn't receive the code?</p>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || resending}
              className="mt-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {resending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend verification code"}
            </button>
          </div>

          {/* BACK */}

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              <FiArrowLeft />
              Back to registration
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyOtp;
