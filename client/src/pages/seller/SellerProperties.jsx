import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiPlus,
  FiSearch,
  FiFilter,
  FiMapPin,
  FiEdit3,
  FiTrash2,
  FiXCircle,
  FiDollarSign,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import PropertyDetailModal from "../../components/common/PropertyDetailModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const SellerProperties = () => {
  const { accessToken, authFetch } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [markingSoldId, setMarkingSoldId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
  // DELETE PROPERTY
  // Backend rule: sold properties CANNOT be deleted.
  // ============================================================

  const handleDelete = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeletingId(propertyId);

      const response = authFetch
        ? await authFetch(`${API_URL}/properties/${propertyId}`, {
            method: "DELETE",
          })
        : await fetch(`${API_URL}/properties/${propertyId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete property");
      }

      // Remove the deleted property from state.
      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyId),
      );
    } catch (error) {
      console.error("Delete property error:", error);

      alert(error.message || "Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // MARK PROPERTY AS SOLD
  // ============================================================

  const handleMarkAsSold = async (propertyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this property as sold? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setMarkingSoldId(propertyId);

      const response = authFetch
        ? await authFetch(`${API_URL}/properties/${propertyId}/sold`, {
            method: "PATCH",
          })
        : await fetch(`${API_URL}/properties/${propertyId}/sold`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark property as sold");
      }

      // Update property status in-place.
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
  // GET IMAGE URL
  // Handles both legacy string format and current {url, publicId} format.
  // ============================================================

  const DEFAULT_PROPERTY_IMAGE =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

  const getImageUrl = (image) => {
    if (!image) return DEFAULT_PROPERTY_IMAGE;
    if (typeof image === "string" && image.trim() !== "") return image;
    if (typeof image === "object") {
      const url =
        image.url || image.secure_url || image.secureUrl || image.path;
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
      ? `Rs. ${formattedPrice} / month`
      : `Rs. ${formattedPrice}`;
  };

  // ============================================================
  // STATUS STYLING
  // Enum from backend: pending | approved | sold
  // ============================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "sold":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  // ============================================================
  // FILTER PROPERTIES
  // ============================================================

  const filteredProperties = properties.filter((property) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      property.title?.toLowerCase().includes(search) ||
      property.location?.city?.toLowerCase().includes(search) ||
      property.location?.district?.toLowerCase().includes(search) ||
      property.propertyType?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="hidden h-11 w-36 animate-pulse rounded-xl bg-slate-200 sm:block" />
        </div>

        <div className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />

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
            <p className="text-sm font-medium text-blue-600">
              Seller Properties
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Properties
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage all your property listings from one place.
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

        {/* ========================================================
          SEARCH & FILTERS
      ======================================================== */}

        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}

            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, city, district or property type..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status Filter — matches backend enum exactly */}

            <div className="relative md:w-52">
              <FiFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium capitalize text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved / Active</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>

          {/* Result count */}

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredProperties.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {properties.length}
              </span>{" "}
              properties
            </p>
          </div>
        </section>

        {/* ========================================================
          EMPTY STATE
      ======================================================== */}

        {filteredProperties.length === 0 ? (
          <section className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiHome className="text-2xl" />
            </div>

            {properties.length === 0 ? (
              <>
                <h2 className="mt-5 text-lg font-semibold text-slate-900">
                  No properties yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  You haven't listed any properties yet. Add your first property
                  to start building your listings.
                </p>

                <Link
                  to="/seller/properties/add"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <FiPlus />
                  Add Property
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-lg font-semibold text-slate-900">
                  No matching properties
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  We couldn't find any properties matching your search or
                  selected filter.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-6 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              </>
            )}
          </section>
        ) : (
          /* ========================================================
           PROPERTY LIST
        ======================================================== */

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
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
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProperties.map((property) => (
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

                      {/* Actions */}

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {/* View inside modal */}
                          <button
                            type="button"
                            onClick={() => setViewingProperty(property)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <FiEye />
                            View
                          </button>

                          {/* Edit — backend blocks editing sold properties */}
                          {property.status !== "sold" && (
                            <Link
                              to={`/seller/properties/${property._id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                            >
                              <FiEdit3 />
                              Edit
                            </Link>
                          )}

                          {/* Mark as Sold — backend only allows this for approved */}
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

                          {/* Delete — backend blocks deleting sold properties */}
                          {property.status !== "sold" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(property._id)}
                              disabled={deletingId === property._id}
                              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <FiTrash2 />
                              {deletingId === property._id
                                ? "Deleting…"
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ======================================================
              MOBILE CARDS
          ====================================================== */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredProperties.map((property) => (
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

                  {/* Property details */}

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
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
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

                      {property.status !== "sold" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(property._id)}
                          disabled={deletingId === property._id}
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <FiTrash2 />
                          {deletingId === property._id ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default SellerProperties;
