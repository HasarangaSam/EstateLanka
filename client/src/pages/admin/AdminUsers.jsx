import { useEffect, useState } from "react";
import {
  FiUsers,
  FiSearch,
  FiTrash2,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiShield,
  FiPlus,
  FiEdit3,
  FiMail,
  FiPhone,
  FiLock,
  FiCheck,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// ADD / EDIT USER MODAL
// ============================================================

const UserFormModal = ({ user: editingUser, onClose, onSave, loading }) => {
  const isEditing = !!editingUser;

  const [name, setName] = useState(editingUser?.name || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [phone, setPhone] = useState(editingUser?.phone || "");
  const [role, setRole] = useState(editingUser?.role || "buyer");
  const [isVerified, setIsVerified] = useState(
    editingUser?.isVerified !== undefined ? editingUser.isVerified : true
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone number are required.");
      return;
    }

    if (!isEditing && !password) {
      setError("Password is required for new users.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        isVerified,
        ...(password ? { password } : {}),
      });
    } catch (err) {
      setError(err.message || "Failed to save user.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <FiX />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            {isEditing ? <FiEdit3 className="text-xl" /> : <FiPlus className="text-2xl" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? "Edit User" : "Add New User"}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditing ? "Update account information" : "Create a new user account"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 flex items-center gap-2">
            <FiXCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["buyer", "seller", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border py-2 text-xs font-bold capitalize transition ${
                    role === r
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-800">Verified User</p>
              <p className="text-[11px] text-slate-500">Allow instant access without OTP</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full" />
            </label>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              {isEditing ? "New Password (optional)" : "Account Password"}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder={isEditing ? "Leave blank to keep current password" : "At least 6 characters"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...(!isEditing ? { required: true } : {})}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="mt-6 flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? (isEditing ? "Saving…" : "Creating…") : (isEditing ? "Update User" : "Create User")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// DELETE CONFIRM MODAL
// ============================================================

const DeleteModal = ({ name, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <FiTrash2 className="text-xl" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Delete User</h3>
          <p className="text-xs text-slate-500">This cannot be undone</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">
        Are you sure you want to permanently delete{" "}
        <strong className="text-slate-900">{name}</strong>? All their data will
        be removed.
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
// ADMIN USERS PAGE
// ============================================================

const AdminUsers = () => {
  const { accessToken, user: currentUser, authFetch } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [userModal, setUserModal] = useState(null); // null = closed, {} = add, object = edit
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ============================================================
  // FETCH USERS
  // ============================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        sort: sortOption,
      });

      if (roleFilter !== "all") params.set("role", roleFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const response = authFetch
        ? await authFetch(`${API_URL}/admin/users?${params}`)
        : await fetch(`${API_URL}/admin/users?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to load users");

      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalUsers(data.pagination?.totalUsers || 0);
    } catch (err) {
      console.error("Admin users fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchUsers();
  }, [accessToken, currentPage, roleFilter, sortOption]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      if (accessToken) fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ============================================================
  // SAVE USER (ADD / EDIT)
  // ============================================================

  const handleSaveUser = async (formData) => {
    setActionLoading(true);
    const isEditing = userModal && userModal._id;

    try {
      const url = isEditing
        ? `${API_URL}/admin/users/${userModal._id}`
        : `${API_URL}/admin/users`;
      const method = isEditing ? "PUT" : "POST";

      const res = authFetch
        ? await authFetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })
        : await fetch(url, {
            method,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save user");

      if (isEditing) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userModal._id ? data.user : u))
        );
      } else {
        setUsers((prev) => [data.user, ...prev]);
        setTotalUsers((n) => n + 1);
      }

      setUserModal(null);
    } catch (err) {
      console.error("Save user error:", err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDelete = async () => {
    try {
      setActionLoading(true);

      const res = authFetch
        ? await authFetch(`${API_URL}/admin/users/${deleteModal._id}`, { method: "DELETE" })
        : await fetch(`${API_URL}/admin/users/${deleteModal._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      setUsers((prev) => prev.filter((u) => u._id !== deleteModal._id));
      setTotalUsers((n) => n - 1);
      setDeleteModal(null);
    } catch (err) {
      console.error("Delete user error:", err);
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getRoleBadge = (role) => {
    const map = {
      admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
      seller: "bg-blue-50 text-blue-700 border-blue-200",
      buyer: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return map[role] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-LK", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* User Form Modal (Add & Edit) */}
      {userModal !== null && (
        <UserFormModal
          user={userModal._id ? userModal : null}
          onClose={() => setUserModal(null)}
          onSave={handleSaveUser}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          name={deleteModal.name}
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
              User Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              All Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {totalUsers} total users registered on EstateLanka
            </p>
          </div>

          <button
            onClick={() => setUserModal({})}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
          >
            <FiPlus className="text-lg" />
            Add User
          </button>
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A–Z</option>
          </select>
        </section>

        {/* Table / Content */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <div className="space-y-0 divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-16 text-center">
              <FiXCircle className="mx-auto text-3xl text-red-400" />
              <p className="mt-3 text-sm text-slate-500">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FiUsers className="mx-auto text-3xl text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      {["User", "Phone", "Role", "Verified", "Joined", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 ${
                              h === "Actions" ? "text-right" : ""
                            }`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u._id}
                        className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
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
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600">
                            {u.phone || "—"}
                          </p>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleBadge(u.role)}`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Verified */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              u.isVerified
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            {u.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-500">
                            {formatDate(u.createdAt)}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setUserModal(u)}
                              title="Edit user details"
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                            >
                              <FiEdit3 />
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteModal(u)}
                              disabled={u._id === currentUser?._id}
                              title="Delete user"
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <FiTrash2 />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {users.map((u) => (
                  <div key={u._id} className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-600">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {u.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {u.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">
                        Joined {formatDate(u.createdAt)}
                      </p>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setUserModal(u)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteModal(u)}
                          disabled={u._id === currentUser?._id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                  <p className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(p - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <FiChevronLeft />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminUsers;
