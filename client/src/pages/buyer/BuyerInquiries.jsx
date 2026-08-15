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
  FiAlertCircle,
  FiExternalLink,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

const BuyerInquiries = () => {
  const { accessToken, authFetch } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = authFetch
        ? await authFetch(`${API_URL}/inquiries/my`)
        : await fetch(`${API_URL}/inquiries/my`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your inquiries");
      }

      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error("Fetch buyer inquiries error:", err);
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchMyInquiries();
    }
  }, [accessToken]);

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
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-sm" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
        <FiAlertCircle className="mx-auto text-2xl mb-2" />
        <p className="text-sm font-semibold">{error}</p>
        <button
          onClick={fetchMyInquiries}
          className="mt-3 text-xs font-bold text-rose-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <FiMessageSquare className="mx-auto text-4xl text-slate-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-800">
          No inquiries sent yet
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          When you browse properties and contact sellers, your inquiries and seller responses will appear here.
        </p>
        <Link
          to="/properties"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          <FiHome /> Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        const hasReplied = inquiry.status === "replied" || inquiry.reply;
        const propertyImage = getImageUrl(inquiry.property?.images?.[0]);

        return (
          <div
            key={inquiry._id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
              {/* Property Image & Details */}
              <div className="bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-2">
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
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Listing <FiExternalLink />
                  </Link>
                )}
              </div>

              {/* Inquiry & Seller Reply */}
              <div className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  {/* Status header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      {hasReplied ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <FiCheckCircle /> Seller Replied
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          <FiClock /> Waiting for Seller Reply
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-400">
                      Sent on{" "}
                      {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Sent Message */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Your Message to Seller:
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      "{inquiry.message}"
                    </p>
                  </div>

                  {/* Seller Reply Box */}
                  {hasReplied && (
                    <div className="mt-3 rounded-xl bg-blue-50/80 p-4 border border-blue-100 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                            {inquiry.seller?.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            Seller Reply ({inquiry.seller?.name || "Seller"})
                          </span>
                        </div>

                        {inquiry.repliedAt && (
                          <span className="text-[11px] text-blue-600 font-medium">
                            {new Date(inquiry.repliedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-800 whitespace-pre-line pt-1">
                        {inquiry.reply}
                      </p>

                      {/* Seller Contacts */}
                      <div className="flex flex-wrap gap-4 pt-2 border-t border-blue-100 text-xs text-slate-600">
                        {inquiry.seller?.email && (
                          <span className="flex items-center gap-1">
                            <FiMail className="text-blue-600" /> {inquiry.seller.email}
                          </span>
                        )}
                        {inquiry.seller?.phone && (
                          <span className="flex items-center gap-1">
                            <FiPhone className="text-blue-600" /> {inquiry.seller.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuyerInquiries;
