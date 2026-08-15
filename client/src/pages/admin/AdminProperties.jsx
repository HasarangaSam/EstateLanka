import { useEffect, useState } from "react";
import {
  FiHome,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiUser,
  FiCalendar,
  FiTag,
  FiGrid,
} from "react-icons/fi";
import { MdBed, MdBathtub } from "react-icons/md";

import { useAuth } from "../../context/AuthContext.jsx";
import PropertyDetailModal from "../../components/common/PropertyDetailModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80";

const statusConfig = {
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: FiCheckCircle,
  },
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: FiClock,
  },
  sold: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: FiHome,
  },
};

// ============================================================
// DELETE CONFIRM MODAL
// ============================================================

const DeleteModal = ({ title, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <FiTrash2 className="text-xl" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Delete Property
          </h3>
          <p className="text-xs text-slate-500">This action cannot be undone</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        Are you sure you want to permanently delete{" "}
        <strong className="text-slate-900">"{title}"</strong>?
      </p>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ============================================================
// ADMIN PROPERTIES PAGE
// ============================================================

const AdminProperties = () => {
  const { accessToken, authFetch } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);

  const [deleteModal, setDeleteModal] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ============================================================
  // FETCH PROPERTIES
  // ============================================================

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortOption,
      });

      if (statusFilter !== "all") params.set("status", statusFilter);
      if (propertyTypeFilter !== "all")
        params.set("propertyType", propertyTypeFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = authFetch
        ? await authFetch(`${API_URL}/admin/properties?${params}`)
        : await fetch(`${API_URL}/admin/properties?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load properties");

      setProperties(data.properties || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProperties(data.pagination?.totalProperties || 0);
    } catch (err) {
      console.error("Admin properties fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchProperties();
  }, [accessToken, currentPage, statusFilter, propertyTypeFilter, sortOption]);

  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      if (accessToken) fetchProperties();
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ============================================================
  // DELETE PROPERTY
  // ============================================================

  const handleDelete = async () => {
    try {
      setActionLoading(true);

      const res = authFetch
        ? await authFetch(`${API_URL}/admin/properties/${deleteModal._id}`, {
            method: "DELETE",
          })
        : await fetch(`${API_URL}/admin/properties/${deleteModal._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      setProperties((prev) => prev.filter((p) => p._id !== deleteModal._id));
      setTotalProperties((n) => n - 1);
      setDeleteModal(null);
    } catch (err) {
      console.error("Delete property error:", err);
      alert(err.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getImageUrl = (image) => {
    if (!image) return DEFAULT_IMG;
    if (typeof image === "string" && image.trim()) return image;
    if (typeof image === "object") {
      const url = image.url || image.secure_url || image.path;
      if (url && typeof url === "string" && url.trim()) return url;
    }
    return DEFAULT_IMG;
  };

  const formatPrice = (price, listingType) => {
    if (price === undefined || price === null) return "—";
    const fmt = new Intl.NumberFormat("en-LK").format(price);
    return listingType === "rent" ? `Rs. ${fmt} / mo` : `Rs. ${fmt}`;
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-LK", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <>
      {/* Property Details Modal */}
      {viewingProperty && (
        <PropertyDetailModal
          property={viewingProperty}
          onClose={() => setViewingProperty(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          title={deleteModal.title}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Property Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              All Properties
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {totalProperties} total properties listed across EstateLanka
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by title, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="sold">Sold</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={propertyTypeFilter}
            onChange={(e) => {
              setPropertyTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
        </section>

        {/* Responsive Grid View (Eliminates horizontal scrolling tables) */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-100 shadow-sm">
              <p className="text-base font-semibold text-red-600">{error}</p>
              <button
                onClick={fetchProperties}
                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-100 shadow-sm">
              <FiHome className="mx-auto text-4xl text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                No properties found
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {properties.map((p) => {
                const cfg = statusConfig[p.status] || statusConfig.approved;
                const StatusIcon = cfg.icon;

                return (
                  <div
                    key={p._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Property Image & Status Overlay */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(p.images?.[0])}
                        alt={p.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMG;
                        }}
                      />

                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="rounded-lg bg-indigo-600/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur shadow">
                          For {p.listingType}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border backdrop-blur shadow ${cfg.badge}`}
                        >
                          <StatusIcon className="text-xs" />
                          {p.status}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                          {p.propertyType}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-900 line-clamp-1">
                          {p.title}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <FiMapPin className="text-indigo-500 shrink-0" />
                          {p.location?.city}, {p.location?.district}
                        </p>

                        <p className="mt-3 text-lg font-extrabold text-slate-900">
                          {formatPrice(p.price, p.listingType)}
                        </p>

                        {/* Specs summary */}
                        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
                          <span className="flex items-center gap-1">
                            <MdBed className="text-sm text-slate-400" />
                            {p.bedrooms ?? 0} Beds
                          </span>
                          <span className="flex items-center gap-1">
                            <MdBathtub className="text-sm text-slate-400" />
                            {p.bathrooms ?? 0} Baths
                          </span>
                          <span className="ml-auto flex items-center gap-1 text-slate-400">
                            <FiCalendar className="text-xs" />
                            {formatDate(p.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Seller Footer Info */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.seller?.avatar ? (
                            <img
                              src={p.seller.avatar}
                              alt={p.seller.name}
                              className="h-7 w-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 shrink-0">
                              {p.seller?.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                          )}
                          <span className="truncate text-xs font-semibold text-slate-700">
                            {p.seller?.name || "Unknown Seller"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setViewingProperty(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                          >
                            <FiEye className="text-xs" />
                            View
                          </button>

                          <button
                            onClick={() => setDeleteModal(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            title="Delete Property"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Showing page{" "}
                <strong className="text-slate-900">{currentPage}</strong> of{" "}
                <strong className="text-slate-900">{totalPages}</strong> (
                {totalProperties} items)
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <FiChevronLeft />
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminProperties;
