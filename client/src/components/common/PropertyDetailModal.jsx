import { useEffect, useState } from "react";
import {
  FiX,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiSquare,
  FiCheckCircle,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiTag,
} from "react-icons/fi";
import { MdBed, MdBathtub } from "react-icons/md";
import LocationDisplayMap from "./LocationDisplayMap.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

const PropertyDetailModal = ({ property: initialProperty, propertyId, onClose }) => {
  const [property, setProperty] = useState(initialProperty || null);
  const [loading, setLoading] = useState(!initialProperty && !!propertyId);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    // Lock scroll on background body when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!initialProperty && propertyId) {
      const fetchProperty = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await fetch(`${API_URL}/properties/${propertyId}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to load property details");
          }
          setProperty(data.property);
        } catch (err) {
          console.error("Error fetching property detail:", err);
          setError(err.message || "Failed to load property details");
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    } else if (initialProperty) {
      setProperty(initialProperty);
    }
  }, [initialProperty, propertyId]);

  const getImageUrl = (img) => {
    if (!img) return FALLBACK_IMAGE;
    if (typeof img === "string" && img.trim() !== "") return img;
    if (typeof img === "object") {
      const url = img.url || img.secure_url || img.secureUrl || img.path;
      if (url && typeof url === "string" && url.trim() !== "") return url;
    }
    return FALLBACK_IMAGE;
  };

  const images = property?.images?.length
    ? property.images.map(getImageUrl)
    : [FALLBACK_IMAGE];

  const formatPrice = (price, listingType) => {
    if (price === undefined || price === null) return "Price not set";
    const formatted = Number(price).toLocaleString("en-LK");
    return listingType === "rent"
      ? `LKR ${formatted} / month`
      : `LKR ${formatted}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <FiHome className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                Property Overview
              </h2>
              <p className="text-xs text-slate-400">
                Detailed View
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-12 text-center space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm text-slate-500 font-medium">Loading property details...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-base font-semibold text-red-600 mb-2">Unable to load details</p>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        ) : property ? (
          <div className="p-6 space-y-6">
            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-inner group">
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="h-full w-full object-cover transition-all duration-300"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="rounded-xl bg-blue-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur shadow-md">
                    For {property.listingType}
                  </span>
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur shadow-md ${
                      property.status === "sold"
                        ? "bg-slate-900/90 text-white"
                        : "bg-emerald-600/90 text-white"
                    }`}
                  >
                    {property.status || "approved"}
                  </span>
                </div>

                {/* Carousel Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur transition hover:bg-slate-900"
                    >
                      <FiChevronLeft className="text-xl" />
                    </button>

                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur transition hover:bg-slate-900"
                    >
                      <FiChevronRight className="text-xl" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        selectedImage === idx
                          ? "border-blue-600 ring-2 ring-blue-600/30"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {property.title}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <FiMapPin className="text-blue-600" />
                  {property.location?.address
                    ? `${property.location.address}, `
                    : ""}
                  {property.location?.city}, {property.location?.district}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <p className="text-2xl font-extrabold text-blue-600">
                  {formatPrice(property.price, property.listingType)}
                </p>
                <p className="text-xs font-semibold capitalize text-slate-400 mt-0.5">
                  {property.propertyType}
                </p>
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MdBed className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bedrooms</p>
                  <p className="text-sm font-bold text-slate-900">
                    {property.bedrooms ?? 0} Beds
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <MdBathtub className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Bathrooms</p>
                  <p className="text-sm font-bold text-slate-900">
                    {property.bathrooms ?? 0} Baths
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FiSquare className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Area</p>
                  <p className="text-sm font-bold text-slate-900">
                    {property.area ?? 0} sqft
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <FiCalendar className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium font-medium">Listed Date</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(property.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-slate-50/70 p-5 border border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs text-blue-600">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Location & Google Map */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Location & Google Map
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <LocationDisplayMap
                  coordinates={property.location?.coordinates}
                  address={property.location?.address}
                  city={property.location?.city}
                  district={property.location?.district}
                  title={property.title}
                />
              </div>
            </div>

            {/* Seller Info Card */}
            {property.seller && (
              <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <FiShield /> Listed By Seller
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    {property.seller.role || "Seller"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {property.seller.avatar ? (
                      <img
                        src={property.seller.avatar}
                        alt={property.seller.name}
                        className="h-12 w-12 rounded-full object-cover border-2 border-indigo-400"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-lg">
                        {property.seller.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-base">{property.seller.name}</p>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <FiMail className="text-indigo-400" /> {property.seller.email}
                      </p>
                    </div>
                  </div>

                  {property.seller.phone && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white border border-white/10 backdrop-blur">
                      <FiPhone className="text-indigo-400" />
                      {property.seller.phone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-20 flex justify-end border-t border-slate-100 bg-white/95 px-6 py-3.5 backdrop-blur">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
