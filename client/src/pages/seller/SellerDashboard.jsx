import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiPlus,
  FiArrowRight,
  FiMapPin,
  FiEdit3,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import PropertyDetailModal from "../../components/common/PropertyDetailModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const SellerDashboard = () => {
  const { user, accessToken, authFetch } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingSoldId, setMarkingSoldId] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);

  // ============================================================
  // GET SELLER PROPERTIES
  // ============================================================

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = authFetch
        ? await authFetch(`${API_URL}/properties/my-properties`)
        : await fetch(`${API_URL}/properties/my-properties`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your properties");
      }

      setProperties(data.properties || []);
    } catch (error) {
      console.error("Get seller properties error:", error);

      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchMyProperties();
    }
  }, [accessToken]);

  // ============================================================
  // MARK PROPERTY AS SOLD
  // Only approved properties can be marked as sold (backend rule).
  // ============================================================

  const handleMarkAsSold = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this property as sold? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setMarkingSoldId(propertyId);

      const response = authFetch
        ? await authFetch(`${API_URL}/properties/${propertyId}/sold`, { method: "PATCH" })
        : await fetch(
            `${API_URL}/properties/${propertyId}/sold`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: "include",
            },
          );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark property as sold");
      }

      // Update the property status in-place so the UI
      // reflects the change without a full re-fetch.
      setProperties((prev) =>
        prev.map((p) => (p._id === propertyId ? { ...p, status: "sold" } : p)),
      );
    } catch (error) {
      console.error("Mark as sold error:", error);
      alert(error.message || "Failed to mark property as sold");
    } finally {
      setMarkingSoldId(null);
    }
  };

  // ============================================================
  // PROPERTY STATISTICS
  // Status enum from backend: pending | approved | sold
  // ============================================================

  const totalProperties = properties.length;

  const activeProperties = properties.filter(
    (property) => property.status === "approved" || !property.status || property.status === "pending",
  ).length;

  const soldProperties = properties.filter(
    (property) => property.status === "sold",
  ).length;

  // ============================================================
  // RECENT PROPERTIES
  // ============================================================

  const recentProperties = properties.slice(0, 5);

  // ============================================================
  // GET IMAGE URL
  // Handles both legacy string format and current {url, publicId} format.
  // ============================================================

const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const getImageUrl = (image) => {
    if (!image) return DEFAULT_PROPERTY_IMAGE;
    if (typeof image === "string" && image.trim() !== "") return image;
    if (typeof image === "object") {
      const url = image.url || image.secure_url || image.secureUrl || image.path;
      if (url && typeof url === "string" && url.trim() !== "") return url;
    }
    return DEFAULT_PROPERTY_IMAGE;
  };

  // ============================================================
  // FORMAT PRICE
  // ============================================================

  const formatPrice = (price, listingType) => {
    if (price === undefined || price === null) {
      return "Price not available";
    }

    const formattedPrice = new Intl.NumberFormat("en-LK").format(price);

    return listingType === "rent"
      ? `LKR ${formattedPrice} / month`
      : `LKR ${formattedPrice}`;
  };

  // ============================================================
  // STATUS STYLING
  // ============================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "sold":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FiXCircle className="text-2xl" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to load properties
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            onClick={fetchMyProperties}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {viewingProperty && (
        <PropertyDetailModal
          property={viewingProperty}
          onClose={() => setViewingProperty(null)}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-8">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Seller Overview</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Keep track of your property listings and their approval status.
          </p>
        </div>

        <Link
          to="/seller/properties/add"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-lg"
        >
          <FiPlus className="text-lg" />
          Add Property
        </Link>
      </section>

      {/* Seller Profile Banner */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-600/15">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover border-4 border-white/20 shadow-inner"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.nextSibling;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white border-4 border-white/20 shadow-inner ${
              user?.avatar ? "hidden" : "flex"
            }`}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div>
            <span className="inline-block rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-100 mb-1">
              Seller Account
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name || "Seller"}!</h2>
            <p className="text-sm text-blue-100">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/seller/profile"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition"
        >
          <FiEdit3 /> Edit Profile
        </Link>
      </section>

      {/* ========================================================
          STATISTICS
          All 5 statuses from the backend model are shown:
          pending | approved | sold
      ======================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total */}

        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Total Properties
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalProperties}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-600">
              <FiHome className="text-xl" />
            </div>
          </div>
        </div>

        {/* Active Properties */}

        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Active Listings
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {activeProperties}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>
        </div>

        {/* Sold Properties */}

        <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Sold Properties
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {soldProperties}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <FiDollarSign className="text-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          RECENT PROPERTIES
      ======================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Header */}

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Properties
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest property listings
            </p>
          </div>

          {properties.length > 0 && (
            <Link
              to="/seller/properties"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              View all
              <FiArrowRight />
            </Link>
          )}
        </div>

        {/* Empty State */}

        {recentProperties.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiHome className="text-2xl" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No properties yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't listed any properties yet. Start by adding your first
              property to EstateLanka.
            </p>

            <Link
              to="/seller/properties/add"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiPlus />
              Add Your First Property
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Property
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Price
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentProperties.map((property) => (
                    <tr
                      key={property._id}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                    >
                      {/* Property */}

                      <td className="px-6 py-4">
                        <div className="flex min-w-64 flex-col gap-3">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <img
                                src={getImageUrl(property.images?.[0])}
                                alt={property.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DEFAULT_PROPERTY_IMAGE;
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-slate-900">
                                {property.title}
                              </h3>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <FiMapPin />
                                {property.location?.city},{" "}
                                {property.location?.district}
                              </p>
                            </div>
                        </div>
                      </div>
                    </td>

                      {/* Type */}

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium capitalize text-slate-700">
                          {property.propertyType}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-400">
                          For {property.listingType}
                        </p>
                      </td>

                      {/* Price */}

                      <td className="px-6 py-4">
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                          {formatPrice(property.price, property.listingType)}
                        </p>
                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                            property.status,
                          )}`}
                        >
                          {property.status}
                        </span>
                      </td>

                      {/* Action */}

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Modal */}
                          <button
                            type="button"
                            onClick={() => setViewingProperty(property)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <FiEye />
                            View
                          </button>

                          {/* Edit — disabled for sold properties (backend rule) */}
                          {property.status !== "sold" && (
                            <Link
                              to={`/seller/properties/${property._id}/edit`}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                            >
                              <FiEdit3 />
                              Edit
                            </Link>
                          )}

                          {/* Mark as Sold — only for approved properties (backend rule) */}
                          {property.status === "approved" && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsSold(property._id)}
                              disabled={markingSoldId === property._id}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <FiDollarSign />
                              {markingSoldId === property._id
                                ? "Marking…"
                                : "Mark Sold"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}

            <div className="divide-y divide-slate-100 md:hidden">
              {recentProperties.map((property) => (
                <div key={property._id} className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}

                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={getImageUrl(property.images?.[0])}
                        alt={property.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_PROPERTY_IMAGE;
                        }}
                      />
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900">
                        {property.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <FiMapPin />
                        {property.location?.city}, {property.location?.district}
                      </p>

                      <p className="mt-2 text-sm font-bold text-blue-600">
                        {formatPrice(property.price, property.listingType)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom information */}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                        property.status,
                      )}`}
                    >
                      {property.status}
                    </span>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingProperty(property)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <FiEye />
                        View
                      </button>

                      {property.status !== "sold" && (
                        <Link
                          to={`/seller/properties/${property._id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                        >
                          <FiEdit3 />
                          Edit
                        </Link>
                      )}

                      {property.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsSold(property._id)}
                          disabled={markingSoldId === property._id}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <FiDollarSign />
                          {markingSoldId === property._id
                            ? "Marking…"
                            : "Mark Sold"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
    </>
  );
};

export default SellerDashboard;
