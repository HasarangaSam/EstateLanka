import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiSend,
  FiX,
  FiAlertCircle,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

const SellerInquiries = () => {
  const { accessToken, authFetch } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'replied'
  const [searchQuery, setSearchQuery] = useState("");

  // Reply Modal State
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  const fetchSellerInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = authFetch
        ? await authFetch(`${API_URL}/inquiries/seller`)
        : await fetch(`${API_URL}/inquiries/seller`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load inquiries");
      }

      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error("Fetch seller inquiries error:", err);
      setError(err.message || "Something went wrong while fetching inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSellerInquiries();
    }
  }, [accessToken]);

  const handleOpenReplyModal = (inquiry) => {
    setActiveInquiry(inquiry);
    setReplyText(inquiry.reply || "");
    setReplyError("");
    setReplySuccess("");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError("Please enter a reply message.");
      return;
    }

    try {
      setReplySubmitting(true);
      setReplyError("");

      const response = authFetch
        ? await authFetch(`${API_URL}/inquiries/${activeInquiry._id}/reply`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: replyText.trim() }),
          })
        : await fetch(
            `${API_URL}/inquiries/${activeInquiry._id}/reply`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: JSON.stringify({ reply: replyText.trim() }),
            }
          );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply");
      }

      setReplySuccess("Reply sent successfully!");

      // Update state in place
      setInquiries((prev) =>
        prev.map((item) =>
          item._id === activeInquiry._id
            ? {
                ...item,
                reply: replyText.trim(),
                status: "replied",
                repliedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setTimeout(() => {
        setActiveInquiry(null);
      }, 1200);
    } catch (err) {
      setReplyError(err.message || "Failed to send reply");
    } finally {
      setReplySubmitting(false);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
        ? inquiry.status === "pending"
        : inquiry.status === "replied";

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      inquiry.buyer?.name?.toLowerCase().includes(searchLower) ||
      inquiry.buyer?.email?.toLowerCase().includes(searchLower) ||
      inquiry.property?.title?.toLowerCase().includes(searchLower) ||
      inquiry.message?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const totalInquiries = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "pending").length;
  const repliedCount = inquiries.filter((i) => i.status === "replied").length;

  const getImageUrl = (image) => {
    if (!image) return DEFAULT_PROPERTY_IMAGE;
    if (typeof image === "string" && image.trim() !== "") return image;
    if (typeof image === "object") {
      const url = image.url || image.secure_url || image.secureUrl;
      if (url && typeof url === "string" && url.trim() !== "") return url;
    }
    return DEFAULT_PROPERTY_IMAGE;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Buyer Messages</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Property Inquiries
          </h1>
          <p className="text-sm text-slate-500">
            View and respond to questions sent by interested buyers.
          </p>
        </div>
      </section>

      {/* Stats overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center justify-between rounded-2xl p-5 border text-left transition ${
            filter === "all"
              ? "border-blue-600 bg-blue-50/50 shadow-sm"
              : "border-slate-100 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inquiries
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalInquiries}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FiMessageSquare className="text-xl" />
          </div>
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`flex items-center justify-between rounded-2xl p-5 border text-left transition ${
            filter === "pending"
              ? "border-amber-500 bg-amber-50/50 shadow-sm"
              : "border-slate-100 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Reply
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <FiClock className="text-xl" />
          </div>
        </button>

        <button
          onClick={() => setFilter("replied")}
          className={`flex items-center justify-between rounded-2xl p-5 border text-left transition ${
            filter === "replied"
              ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
              : "border-slate-100 bg-white hover:bg-slate-50"
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Replied
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{repliedCount}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <FiCheckCircle className="text-xl" />
          </div>
        </button>
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {["all", "pending", "replied"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "all" ? "All Messages" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search buyer, property, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>
      </section>

      {/* Inquiry List */}
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
          <FiAlertCircle className="mx-auto text-2xl mb-2" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchSellerInquiries}
            className="mt-3 text-xs font-bold text-rose-800 underline"
          >
            Retry
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FiMessageSquare className="mx-auto text-4xl text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No inquiries found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery || filter !== "all"
              ? "Try adjusting your search query or status filter."
              : "When buyers send inquiries about your properties, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const hasReplied = inquiry.status === "replied" || inquiry.reply;
            const propertyImage = getImageUrl(inquiry.property?.images?.[0]);

            return (
              <div
                key={inquiry._id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] border-b border-slate-100">
                  {/* Property Info Sidebar */}
                  <div className="bg-slate-50/80 p-5 border-r border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3">
                        <img
                          src={propertyImage}
                          alt={inquiry.property?.title || "Property"}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {inquiry.property?.propertyType || "Property"}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {inquiry.property?.title || "Property Title"}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 mt-1">
                        LKR {Number(inquiry.property?.price || 0).toLocaleString("en-LK")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {inquiry.property?.location?.city},{" "}
                        {inquiry.property?.location?.district}
                      </p>
                    </div>

                    {inquiry.property?._id && (
                      <Link
                        to={`/properties/${inquiry.property._id}`}
                        className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <FiHome /> View Listing
                      </Link>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      {/* Buyer Details Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          {inquiry.buyer?.avatar ? (
                            <img
                              src={inquiry.buyer.avatar}
                              alt={inquiry.buyer.name}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                              {inquiry.buyer?.name?.charAt(0)?.toUpperCase() || "B"}
                            </div>
                          )}

                          <div>
                            <h5 className="text-sm font-bold text-slate-900">
                              {inquiry.buyer?.name || "Buyer"}
                            </h5>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                              {inquiry.buyer?.email && (
                                <span className="flex items-center gap-1">
                                  <FiMail className="text-slate-400" /> {inquiry.buyer.email}
                                </span>
                              )}
                              {inquiry.buyer?.phone && (
                                <span className="flex items-center gap-1">
                                  <FiPhone className="text-slate-400" /> {inquiry.buyer.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                              hasReplied
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {hasReplied ? "Replied" : "Pending Reply"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Buyer's Message */}
                      <div className="my-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Buyer Message:
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          "{inquiry.message}"
                        </p>
                      </div>

                      {/* Seller Reply Box (If Replied) */}
                      {hasReplied && (
                        <div className="my-3 rounded-xl bg-blue-50/70 p-4 border border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                              Your Reply:
                            </p>
                            {inquiry.repliedAt && (
                              <span className="text-[11px] text-blue-500">
                                {new Date(inquiry.repliedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-800 whitespace-pre-line">
                            {inquiry.reply}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleOpenReplyModal(inquiry)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                          hasReplied
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        }`}
                      >
                        <FiSend />
                        {hasReplied ? "Update Reply" : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Reply to {activeInquiry.buyer?.name || "Buyer"}
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">
                  Re: {activeInquiry.property?.title}
                </p>
              </div>
              <button
                onClick={() => setActiveInquiry(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4">
              {replyError && (
                <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {replyError}
                </div>
              )}

              {replySuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-semibold">
                  {replySuccess}
                </div>
              )}

              {/* Original Message Quote */}
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Original Inquiry: </span>
                "{activeInquiry.message}"
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Reply Message *
                </label>
                <textarea
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message to the buyer here..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveInquiry(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white transition shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  <FiSend />
                  {replySubmitting ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInquiries;
