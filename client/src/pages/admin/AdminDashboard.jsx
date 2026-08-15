import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiHome,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiTrendingUp,
  FiXCircle,
  FiDollarSign,
  FiEye,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import PropertyDetailModal from "../../components/common/PropertyDetailModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// STAT CARD COMPONENT
// ============================================================

const StatCard = ({ label, value, icon: Icon, bgColor, iconColor, trend }) => (
  <div className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-2 text-3xl font-bold text-slate-900">{value ?? "—"}</p>

        {trend !== undefined && (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <FiTrendingUp className="text-xs" />
            {trend}
          </p>
        )}
      </div>

      <div className={`rounded-xl p-3 ${bgColor}`}>
        <Icon className={`text-xl ${iconColor}`} />
      </div>
    </div>
  </div>
);

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard = () => {
  const { user, accessToken, authFetch } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingProperty, setViewingProperty] = useState(null);

  // ============================================================
  // FETCH DASHBOARD DATA
  // ============================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const fetchHelper = authFetch || fetch;
      const headers = { Authorization: `Bearer ${accessToken}` };
      const opts = { headers, credentials: "include" };

      const [statsRes, usersRes, propsRes] = await Promise.all([
        fetchHelper(`${API_URL}/admin/properties/stats`, opts),
        fetchHelper(`${API_URL}/admin/users?limit=5&sort=newest`, opts),
        fetchHelper(`${API_URL}/admin/properties?limit=5&sort=newest`, opts),
      ]);

      if (!statsRes.ok || !usersRes.ok || !propsRes.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const [statsData, usersData, propsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        propsRes.json(),
      ]);

      setStats(statsData);
      setRecentUsers(usersData.users || []);
      setRecentProperties(propsData.properties || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDashboardData();
    }
  }, [accessToken]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getStatusBadge = (status) => {
    const map = {
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      sold: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
      seller: "bg-blue-50 text-blue-700 border-blue-200",
      buyer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return map[role] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const DEFAULT_IMG =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=60";

  const getImageUrl = (image) => {
    if (!image) return DEFAULT_IMG;
    if (typeof image === "string" && image.trim()) return image;
    if (typeof image === "object") {
      const url = image.url || image.secure_url || image.path;
      if (url && typeof url === "string" && url.trim()) return url;
    }
    return DEFAULT_IMG;
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
          <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
        </div>
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
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            onClick={fetchDashboardData}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
          <p className="text-sm font-semibold text-indigo-600">
            Administrator Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Platform-wide statistics and recent activity for EstateLanka.
          </p>
        </div>
      </section>

      {/* ADMIN PROFILE BANNER */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-900 p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/50 text-2xl font-bold text-white border-4 border-white/20">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          <div>
            <span className="inline-block rounded-md bg-indigo-500/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">
              Admin Account
            </span>

            <h2 className="text-xl sm:text-2xl font-bold">
              Welcome back, {user?.name || "Admin"}!
            </h2>

            <p className="text-sm text-indigo-200">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition"
          >
            <FiUsers />
            Manage Users
          </Link>
          <Link
            to="/admin/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition"
          >
            <FiHome />
            Manage Properties
          </Link>
        </div>
      </section>

      {/* ========================================================
          STATISTICS CARDS
      ======================================================== */}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers}
          icon={FiUsers}
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />

        <StatCard
          label="Total Properties"
          value={stats?.totalProperties}
          icon={FiHome}
          bgColor="bg-slate-100"
          iconColor="text-slate-600"
        />

        <StatCard
          label="Approved"
          value={stats?.propertiesByStatus?.approved}
          icon={FiCheckCircle}
          bgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          label="Sold"
          value={stats?.propertiesByStatus?.sold}
          icon={FiDollarSign}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
      </section>

      {/* SECONDARY STATS */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Buyers",
            value: stats?.usersByRole?.buyer,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Sellers",
            value: stats?.usersByRole?.seller,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Sold",
            value: stats?.propertiesByStatus?.sold,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`rounded-2xl ${bg} px-5 py-4 text-center`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value ?? 0}</p>
          </div>
        ))}
      </section>

      {/* ========================================================
          RECENT DATA TABLES
      ======================================================== */}

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Users
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Newest registrations
              </p>
            </div>

            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View all
              <FiArrowRight />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiUsers className="mx-auto text-3xl text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No users found</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentUsers.map((u) => (
                <li
                  key={u._id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(u.role)}`}
                  >
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Properties */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Properties
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Latest listings submitted
              </p>
            </div>

            <Link
              to="/admin/properties"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View all
              <FiArrowRight />
            </Link>
          </div>

          {recentProperties.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiHome className="mx-auto text-3xl text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No properties found</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentProperties.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition"
                >
                  <div
                    onClick={() => setViewingProperty(p)}
                    className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer group"
                  >
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={getImageUrl(p.images?.[0])}
                        alt={p.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMG;
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                        {p.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.location?.city}, {p.location?.district}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(p.status)}`}
                    >
                      {p.status}
                    </span>

                    <button
                      onClick={() => setViewingProperty(p)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                      title="View Details"
                    >
                      <FiEye className="text-sm" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
    </>
  );
};

export default AdminDashboard;
