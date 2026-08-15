import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiLoader,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!form.name.trim()) return setErrorMsg("Please enter your name.");
    if (!form.email.trim()) return setErrorMsg("Please enter your email address.");
    if (!form.subject.trim()) return setErrorMsg("Please enter a subject.");
    if (!form.message.trim()) return setErrorMsg("Please enter your message.");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      // Safely parse JSON — server might return HTML on 404/500
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Unable to reach the server. Please make sure the server is running and try again.",
        );
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send contact message.");
      }

      setSuccessMsg(data.message || "Your message has been sent successfully!");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact submit error:", err);
      setErrorMsg(
        err.message ||
        "Something went wrong while sending your message. Please ensure the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Get In Touch</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Contact EstateLanka Support
        </h1>
        <p className="text-sm text-slate-500">
          Have a question about buying, selling, or listing properties? Send us a message and our team will respond to your email.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Contact Info Cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Contact Information</h2>

            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiMail size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Admin Email</p>
                  <a href="mailto:hasarangahasaranga2002.03.10@gmail.com" className="text-blue-600 hover:underline">
                    hasarangahasaranga2002.03.10@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiPhone size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Support Hotline</p>
                  <p className="text-slate-600">+94 11 234 5678</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Main Office</p>
                  <p className="text-slate-600">Colombo, Sri Lanka</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FiClock size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Operating Hours</p>
                  <p className="text-slate-600">Mon &ndash; Sat: 8:00 AM &ndash; 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Send Us a Direct Message</h2>

          {successMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <FiCheckCircle size={20} className="shrink-0 text-emerald-600" />
              <p>{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <FiAlertCircle size={20} className="shrink-0 text-red-500" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Kasun Perera"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. kasun@example.com"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 077 123 4567"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label htmlFor="subject" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Inquiry regarding selling property"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message details here..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <FiSend />
                  <span>Send Message to Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
