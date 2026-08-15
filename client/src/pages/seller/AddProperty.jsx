import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiHome,
  FiLoader,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import LocationPickerMap from "../../components/common/LocationPickerMap.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const SRI_LANKAN_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const AddProperty = () => {
  const navigate = useNavigate();
  const { accessToken, authFetch } = useAuth();
  const fileInputRef = useRef(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "house",
    listingType: "sale",
    price: "",
    address: "",
    district: "",
    city: "",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    coordinates: { lat: "", lng: "" },
  });

  // Images State
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFieldErrors([]);
  };

  // Image selection handler
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (files.length + selected.length > 8) {
      setFormError("A property can have a maximum of 8 images.");
      return;
    }

    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    setFiles((prev) => [...prev, ...selected]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(filePreviews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors([]);

    // Frontend validation
    const errors = [];
    if (!form.title.trim()) errors.push("Property title is required");
    else if (form.title.trim().length < 5)
      errors.push("Title must be at least 5 characters");

    if (!form.description.trim()) errors.push("Description is required");
    else if (form.description.trim().length < 20)
      errors.push("Description must be at least 20 characters");

    if (!form.propertyType) errors.push("Property type is required");
    if (!form.listingType) errors.push("Listing type is required");

    if (form.price === "" || Number(form.price) < 0)
      errors.push("Valid price is required");

    if (!form.address.trim()) errors.push("Address is required");
    if (!form.district) errors.push("District is required");
    if (!form.city.trim()) errors.push("City is required");

    if (form.bedrooms === "" || Number(form.bedrooms) < 0)
      errors.push("Valid bedrooms count is required");

    if (form.bathrooms === "" || Number(form.bathrooms) < 0)
      errors.push("Valid bathrooms count is required");

    if (form.area === "" || Number(form.area) < 0)
      errors.push("Valid property area is required");

    if (files.length === 0) {
      errors.push("At least one property image is required");
    }

    if (errors.length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("propertyType", form.propertyType);
      formData.append("listingType", form.listingType);
      formData.append("price", form.price);
      formData.append("address", form.address.trim());
      formData.append("district", form.district);
      formData.append("city", form.city.trim());
      if (form.coordinates?.lat !== "" && form.coordinates?.lng !== "") {
        formData.append("lat", form.coordinates.lat);
        formData.append("lng", form.coordinates.lng);
      }
      formData.append("bedrooms", form.bedrooms);
      formData.append("bathrooms", form.bathrooms);
      formData.append("area", form.area);

      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = authFetch
        ? await authFetch(`${API_URL}/properties`, {
            method: "POST",
            body: formData,
          })
        : await fetch(`${API_URL}/properties`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: formData,
          });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setFieldErrors(data.errors);
        } else {
          setFormError(data.message || "Failed to create property.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/seller/properties");
      }, 1500);
    } catch (error) {
      console.error("Create property error:", error);
      setFormError("Something went wrong while connecting to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <FiCheckCircle className="text-2xl" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Property Listed Successfully!
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your property is now live and visible in all property listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <section className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/seller/properties")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <FiArrowLeft />
        </button>

        <div>
          <p className="text-sm font-medium text-blue-600">Seller Portal</p>

          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
            Add New Property
          </h1>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Error Alert */}
        {(formError || fieldErrors.length > 0) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <FiAlertCircle className="text-base" />
              <span>Please check the errors below</span>
            </div>
            {formError && <p className="mt-1">{formError}</p>}
            {fieldErrors.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1">
                {fieldErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Basic Information */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Basic Information</h2>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label htmlFor="title" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Property Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Modern 3 Bedroom Luxury Apartment in Rajagiriya"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the property, surrounding amenities, features..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="propertyType" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Property Type *
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>

              <div>
                <label htmlFor="listingType" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Listing Type *
                </label>
                <select
                  id="listingType"
                  name="listingType"
                  value={form.listingType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="price" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Price (LKR) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 45000000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Location</h2>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label htmlFor="address" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Street Address *
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. No 123, Nawala Road"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="district" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  District *
                </label>
                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select District</option>
                  {SRI_LANKAN_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="city" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  City / Town *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Rajagiriya"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Map Picker */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <LocationPickerMap
                value={form.coordinates}
                onChange={(coords) =>
                  setForm((prev) => ({ ...prev, coordinates: coords }))
                }
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Property Details</h2>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-3">
            <div>
              <label htmlFor="bedrooms" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Bedrooms *
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Bathrooms *
              </label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="area" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Area (Sq Ft) *
              </label>
              <input
                id="area"
                name="area"
                type="number"
                min="0"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. 1800"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Property Images</h2>
            <p className="mt-1 text-xs text-slate-400">
              Upload up to 8 images (At least 1 image is required).
            </p>
          </div>

          <div className="space-y-4 p-6">
            {/* Upload Area */}
            {files.length < 8 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 transition hover:border-blue-500 hover:bg-blue-50/50"
              >
                <FiUpload className="text-3xl text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  Click to upload property images
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  PNG, JPG, WEBP up to 8MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Previews */}
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {filePreviews.map((src, idx) => (
                  <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl bg-slate-100">
                    <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute right-2 top-2 rounded-lg bg-slate-900/60 p-1.5 text-white backdrop-blur transition hover:bg-red-600"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/seller/properties")}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin text-base" />
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Property</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
