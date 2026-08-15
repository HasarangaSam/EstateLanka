import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiCamera,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiMessageSquare,
} from "react-icons/fi";

import BuyerInquiries from "../buyer/BuyerInquiries.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Avatar helper ────────────────────────────────────────────────────────────
function Avatar({ src, name, size = "h-24 w-24", textSize = "text-3xl" }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={`${size} rounded-full object-cover border-4 border-blue-500 shadow-lg`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ${textSize} font-extrabold text-white border-4 border-blue-500 shadow-lg`}
    >
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ user, accessToken, onClose, onSaved }) {
  const { authFetch } = useAuth();
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = authFetch
        ? await authFetch(`${API_URL}/users/profile`, {
            method: "PATCH",
            body: formData,
          })
        : await fetch(`${API_URL}/users/profile`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
            body: formData,
          });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      onSaved(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiEdit2 className="text-blue-600" /> Edit Profile
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={avatarPreview} name={name} size="h-20 w-20" textSize="text-2xl" />
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-colors"
              >
                <FiCamera size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-400">Click camera to change avatar</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Your phone number"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheck />
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Modal ───────────────────────────────────────────────────
function ChangePasswordModal({ accessToken, onClose }) {
  const { authFetch } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = authFetch
        ? await authFetch(`${API_URL}/users/change-password`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
          })
        : await fetch(`${API_URL}/users/change-password`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({ currentPassword, newPassword }),
          });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FiLock className="text-blue-600" /> Change Password
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <FiX />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <FiCheck className="text-green-600 text-2xl" />
            </div>
            <p className="font-semibold text-slate-800">Password changed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="New password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiCheck />
                )}
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FiAlertTriangle className="text-red-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Delete Account?</h3>
          <p className="text-sm text-slate-500">
            This action is <strong>permanent</strong>. All your data, listings, and
            favourites will be removed and cannot be recovered.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiTrash2 />
              )}
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Account Page ────────────────────────────────────────────────────────
function Account() {
  const { user, accessToken, updateUser, deleteUserAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'inquiries'

  if (!user) return null;

  const handleSaved = (updatedUser) => {
    updateUser(updatedUser);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserAccount();
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Modals */}
      {showEdit && (
        <EditProfileModal
          user={user}
          accessToken={accessToken}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}
      {showPassword && (
        <ChangePasswordModal
          accessToken={accessToken}
          onClose={() => setShowPassword(false)}
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          loading={deleteLoading}
        />
      )}

      {/* Page */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal details, settings, and inquiries
            </p>
          </div>

          {/* Tab Navigation for Buyers */}
          {user.role === "buyer" && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-200/70 p-1.5 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "profile"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiUser /> Profile &amp; Settings
              </button>

              <button
                onClick={() => setActiveTab("inquiries")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === "inquiries"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FiMessageSquare /> My Inquiries
              </button>
            </div>
          )}
        </div>

        {activeTab === "inquiries" && user.role === "buyer" ? (
          <BuyerInquiries />
        ) : (
          <>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 space-y-6">

          {/* Avatar + name row */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar src={user.avatar} name={user.name} />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <FiShield size={12} /> {user.role} Account
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              <button
                id="edit-profile-btn"
                onClick={() => setShowEdit(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FiEdit2 size={14} /> Edit Profile
              </button>
              <button
                id="change-password-btn"
                onClick={() => setShowPassword(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FiLock size={14} /> Password
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={<FiUser />} label="Full Name" value={user.name} />
            <InfoCard icon={<FiMail />} label="Email Address" value={user.email} />
            <InfoCard
              icon={<FiPhone />}
              label="Phone Number"
              value={user.phone || "Not provided"}
            />
            <InfoCard
              icon={<FiCalendar />}
              label="Member Since"
              value={formatDate(user.createdAt)}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-red-800">Danger Zone</h3>
              <p className="mt-0.5 text-sm text-red-600">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              id="delete-account-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <FiTrash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </>
  );
}

// ─── Info Card Component ──────────────────────────────────────────────────────
function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        {icon} {label}
      </p>
      <p className="text-base font-semibold text-slate-800 break-words">{value}</p>
    </div>
  );
}

export default Account;
