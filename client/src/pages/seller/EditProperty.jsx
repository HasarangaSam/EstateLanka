import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

// Sri Lankan districts — must match backend enum exactly.
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

// ============================================================
// HELPERS
// ============================================================

// Normalise an image entry from the API into { url, publicId }.
// Handles both the legacy plain-string format and the current
// { url, publicId } object format.
const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

const normaliseImage = (image) => {
  if (!image) return null;
  if (typeof image === "string") return { url: image, publicId: image };
  return {
    url: image.url || image.secure_url || image.secureUrl || "",
    publicId: image.publicId || image.public_id || image.publicId || "",
  };
};

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, authFetch } = useAuth();
  const fileInputRef = useRef(null);

  // ============================================================
  // FETCH STATE
  // ============================================================

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // ============================================================
  // FORM STATE
  // Every field maps 1-to-1 with the backend updateProperty body.
  // ============================================================

  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyType: "",
    listingType: "",
    price: "",
    address: "",
    district: "",
    city: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    coordinates: { lat: "", lng: "" },
  });

  // Existing images to keep — sent as JSON string in existingImages field.
  // Each entry: { url, publicId }
  const [existingImages, setExistingImages] = useState([]);

  // New files the seller selected from disk.
  const [newFiles, setNewFiles] = useState([]);
  // Preview URLs for the new files (object URLs, revoked on cleanup).
  const [newFilePreviews, setNewFilePreviews] = useState([]);

  // ============================================================
  // SUBMIT STATE
  // ============================================================

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // FETCH PROPERTY
  // We fetch from /my-properties and find the matching one so
  // we only expose the seller's own data (no separate endpoint needed).
  // ============================================================

  useEffect(() => {
    if (!accessToken) return;

    const fetchProperty = async () => {
      try {
        setFetchLoading(true);
        setFetchError("");

        const response = authFetch
          ? await authFetch(`${API_URL}/properties/my-properties`)
          : await fetch(
              `${API_URL}/properties/my-properties`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
                credentials: "include",
              },
            );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load property");
        }

        const property = (data.properties || []).find((p) => p._id === id);

        if (!property) {
          setFetchError("Property not found or does not belong to you.");
          return;
        }

        // Backend rule: sold properties cannot be edited.
        if (property.status === "sold") {
          setFetchError("Sold properties cannot be edited.");
          return;
        }

        // Populate form.
        setForm({
          title: property.title || "",
          description: property.description || "",
          propertyType: property.propertyType || "",
          listingType: property.listingType || "",
          price: property.price !== undefined ? String(property.price) : "",
          address: property.location?.address || "",
          district: property.location?.district || "",
          city: property.location?.city || "",
          bedrooms:
            property.bedrooms !== undefined ? String(property.bedrooms) : "",
          bathrooms:
            property.bathrooms !== undefined ? String(property.bathrooms) : "",
          area: property.area !== undefined ? String(property.area) : "",
          coordinates: {
            lat: property.location?.coordinates?.lat ?? "",
            lng: property.location?.coordinates?.lng ?? "",
          },
        });

        // Normalise images to handle legacy string format.
        setExistingImages(
          (property.images || []).map(normaliseImage).filter(Boolean),
        );
      } catch (error) {
        console.error("Fetch property error:", error);
        setFetchError(error.message || "Something went wrong");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProperty();
  }, [accessToken, id]);

  // Revoke object URLs when new files change.
  useEffect(() => {
    return () => {
      newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newFilePreviews]);

  // ============================================================
  // COMPUTED: total image count
  // Backend rule: must be 1–8 total (existing kept + new files).
  // ============================================================

  const totalImageCount = existingImages.length + newFiles.length;

  // ============================================================
  // HANDLERS — FORM FIELDS
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setFieldErrors([]);
  };

  // ============================================================
  // HANDLERS — NEW FILE SELECTION
  // Backend: field name "images", max 8 total, max 5 MB each.
  // ============================================================

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files);

    if (selected.length === 0) return;

    // Enforce max 8 total.
    const remaining = 8 - existingImages.length - newFiles.length;

    if (remaining <= 0) {
      setFormError("You already have 8 images. Remove one first.");
      event.target.value = "";
      return;
    }

    const allowed = selected.slice(0, remaining);

    // Validate each file (5 MB limit, images only — mirrors backend).
    const oversized = allowed.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setFormError(
        `${oversized.length} file(s) exceed the 5 MB limit and were skipped.`,
      );
    }

    const valid = allowed.filter((f) => f.size <= 5 * 1024 * 1024);

    setNewFiles((prev) => [...prev, ...valid]);
    setNewFilePreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);

    event.target.value = "";
    setFormError("");
  };

  // ============================================================
  // HANDLERS — REMOVE EXISTING IMAGE
  // Backend sends back only the images in existingImages JSON.
  // ============================================================

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // HANDLERS — REMOVE NEW FILE
  // ============================================================

  const removeNewFile = (index) => {
    URL.revokeObjectURL(newFilePreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // SUBMIT
  // Uses multipart/form-data because new images may be attached.
  // existingImages is serialised as JSON string.
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors([]);

    // Client-side guard: at least 1 image total.
    if (totalImageCount === 0) {
      setFormError("A property must have at least one image.");
      return;
    }

    // Client-side guard: no more than 8 images.
    if (totalImageCount > 8) {
      setFormError("A property can have a maximum of 8 images.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      // Text fields — only append if the value is not empty so we
      // don't accidentally overwrite with empty strings.
      if (form.title) formData.append("title", form.title);
      if (form.description) formData.append("description", form.description);
      if (form.propertyType) formData.append("propertyType", form.propertyType);
      if (form.listingType) formData.append("listingType", form.listingType);
      if (form.price !== "") formData.append("price", form.price);
      if (form.address) formData.append("address", form.address);
      if (form.district) formData.append("district", form.district);
      if (form.city) formData.append("city", form.city);
      if (form.coordinates?.lat !== "" && form.coordinates?.lng !== "") {
        formData.append("lat", form.coordinates.lat);
        formData.append("lng", form.coordinates.lng);
      }
      if (form.bedrooms !== "") formData.append("bedrooms", form.bedrooms);
      if (form.bathrooms !== "") formData.append("bathrooms", form.bathrooms);
      if (form.area !== "") formData.append("area", form.area);

      // existingImages sent as a JSON string — backend parses it.
      // Only include { url, publicId } pairs that belong to the
      // original property (legacy string images have publicId === url).
      formData.append("existingImages", JSON.stringify(existingImages));

      // New image files — field name must be "images" (matches multer config).
      newFiles.forEach((file) => formData.append("images", file));

      const response = authFetch
        ? await authFetch(`${API_URL}/properties/${id}`, {
            method: "PATCH",
            body: formData,
          })
        : await fetch(`${API_URL}/properties/${id}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: formData,
          });

      const data = await response.json();

      if (!response.ok) {
        // Backend sends { message, errors[] } on validation failures.
        if (data.errors && data.errors.length > 0) {
          setFieldErrors(data.errors);
        } else {
          setFormError(data.message || "Failed to update property");
        }
        return;
      }

      setSuccess(true);

      // Navigate to properties list after a short delay.
      setTimeout(() => navigate("/seller/properties"), 2000);
    } catch (error) {
      console.error("Update property error:", error);
      setFormError(error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (fetchLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-[600px] animate-pulse rounded-2xl bg-white shadow-sm" />
      </div>
    );
  }

  // ============================================================
  // ERROR STATE (fetch failed or sold property)
  // ============================================================

  if (fetchError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FiAlertCircle className="text-2xl" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Cannot edit property
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{fetchError}</p>

          <button
            onClick={() => navigate("/seller/properties")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiArrowLeft />
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // SUCCESS STATE
  // ============================================================

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <FiCheckCircle className="text-2xl" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Property updated!
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your property changes have been saved successfully and are now live.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <section className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/seller/properties")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <FiArrowLeft />
        </button>

        <div>
          <p className="text-sm font-medium text-blue-600">Seller Properties</p>

          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
            Edit Property
          </h1>
        </div>
      </section>



      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* ======================================================
            BASIC INFORMATION
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Basic Information</h2>
          </div>

          <div className="space-y-5 p-6">
            {/* Title */}

            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Property Title{" "}
                <span className="text-slate-400">(5–150 characters)</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                minLength={5}
                maxLength={150}
                required
                placeholder="e.g. Modern 4-bedroom house in Colombo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description{" "}
                <span className="text-slate-400">(20–5000 characters)</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                minLength={20}
                maxLength={5000}
                required
                placeholder="Describe your property in detail..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length} / 5000
              </p>
            </div>

            {/* Property Type & Listing Type */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="propertyType"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Property Type
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  value={form.propertyType}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select type</option>
                  {/* Backend enum: house | apartment */}
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="listingType"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Listing Type
                </label>

                <select
                  id="listingType"
                  name="listingType"
                  value={form.listingType}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select type</option>
                  {/* Backend enum: sale | rent */}
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
            </div>

            {/* Price */}

            <div>
              <label
                htmlFor="price"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Price{" "}
                <span className="text-slate-400">
                  (LKR
                  {form.listingType === "rent" ? " / month" : ""})
                </span>
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  LKR
                </span>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-14 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            LOCATION
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Location</h2>
          </div>

          <div className="space-y-5 p-6">
            {/* Address */}

            <div>
              <label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Address{" "}
                <span className="text-slate-400">(max 300 characters)</span>
              </label>

              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                maxLength={300}
                required
                placeholder="Street number and name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* District & City */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="district"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  District
                </label>

                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select district</option>
                  {SRI_LANKAN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  City{" "}
                  <span className="text-slate-400">(max 100 characters)</span>
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Colombo 03"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
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

        {/* ======================================================
            PROPERTY DETAILS
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Property Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
            {/* Bedrooms */}

            <div>
              <label
                htmlFor="bedrooms"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Bedrooms
              </label>

              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Bathrooms */}

            <div>
              <label
                htmlFor="bathrooms"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Bathrooms
              </label>

              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Area */}

            <div>
              <label
                htmlFor="area"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Area <span className="text-slate-400">(sq ft)</span>
              </label>

              <input
                id="area"
                name="area"
                type="number"
                min={0}
                value={form.area}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            IMAGES
            Backend rules:
            - Multer field name: "images"
            - Max 8 total (existing kept + new)
            - Max 5 MB per file
            - existingImages sent as JSON string of { url, publicId }[]
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Images</h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {totalImageCount} / 8 images &mdash; max 5 MB per file
              </p>
            </div>

            {totalImageCount < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <FiUpload />
                Add Images
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="p-6">
            {totalImageCount === 0 ? (
              /* Upload zone when no images at all */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 py-12 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <FiUpload className="text-2xl" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload images
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PNG, JPG, WebP up to 5 MB each — max 8 total
                  </p>
                </div>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {/* Existing images (already on Cloudinary) */}
                {existingImages.map((image, index) => (
                  <div
                    key={`existing-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={image.url || DEFAULT_PROPERTY_IMAGE}
                      alt={`Property image ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_PROPERTY_IMAGE;
                      }}
                    />

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <FiX className="text-xs" />
                    </button>

                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {/* New files (not yet uploaded) */}
                {newFilePreviews.map((preview, index) => (
                  <div
                    key={`new-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-2 ring-blue-400 ring-offset-2"
                  >
                    <img
                      src={preview}
                      alt={`New image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <FiX className="text-xs" />
                    </button>

                    <span className="absolute bottom-2 left-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      New
                    </span>
                  </div>
                ))}

                {/* Add more tile */}
                {totalImageCount < 8 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-blue-400 hover:text-blue-500"
                  >
                    <FiUpload className="text-xl" />
                    <span className="text-xs font-medium">Add</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            ERRORS
        ====================================================== */}

        {(formError || fieldErrors.length > 0) && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" />

            <div className="text-sm text-red-700">
              {formError && <p>{formError}</p>}

              {fieldErrors.length > 0 && (
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {fieldErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ======================================================
            SUBMIT
        ====================================================== */}

        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/seller/properties")}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || totalImageCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <>
                <FiLoader className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <FiHome />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;
