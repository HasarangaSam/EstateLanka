import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiBarChart2,
  FiHome,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiSend,
  FiShield,
  FiSquare,
  FiUser,
  FiX,
} from "react-icons/fi";

import { MdBed, MdBathtub } from "react-icons/md";

import { useAuth } from "../context/AuthContext";
import { useCompare } from "../context/CompareContext";
import LocationDisplayMap from "../components/common/LocationDisplayMap.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, accessToken, authFetch } = useAuth();

  const { addPropertyToCompare, removePropertyFromCompare, isCompared } =
    useCompare();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/properties/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load property");
        }

        setProperty(data.property);
        setSelectedImage(0);
      } catch (error) {
        console.error("Fetch property error:", error);

        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatPrice = (price, listingType) => {
    const formattedPrice = Number(price).toLocaleString("en-LK");

    if (listingType === "rent") {
      return `Rs. ${formattedPrice}`;
    }

    return `Rs. ${formattedPrice}`;
  };

  const nextImage = () => {
    if (!images.length) return;

    setSelectedImage((current) => {
      if (current >= images.length - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  const previousImage = () => {
    if (!images.length) return;

    setSelectedImage((current) => {
      if (current <= 0) {
        return images.length - 1;
      }

      return current - 1;
    });
  };

  const openImageViewer = (index = selectedImage) => {
    setSelectedImage(index);
    setShowImageViewer(true);
  };

  // ------------------------------------------------------------
  // Compare property
  // ------------------------------------------------------------

  const handleCompare = () => {
    if (!property?._id) {
      return;
    }

    // If already compared, remove it.
    if (isCompared(property._id)) {
      removePropertyFromCompare(property._id);
      return;
    }

    // Otherwise add it.
    const result = addPropertyToCompare(property._id);

    // The storage utility already handles the
    // maximum of 2 properties.
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (!inquiryMessage.trim()) {
      setInquiryError("Please enter a message.");
      return;
    }

    if (inquiryMessage.trim().length < 5) {
      setInquiryError("Message must be at least 5 characters.");
      return;
    }

    if (inquiryMessage.trim().length > 2000) {
      setInquiryError("Message cannot exceed 2000 characters.");
      return;
    }

    try {
      setSendingInquiry(true);
      setInquiryError("");
      setInquirySuccess("");

      const response = authFetch
        ? await authFetch(`${API_URL}/inquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: property._id,
              message: inquiryMessage.trim(),
            }),
          })
        : await fetch(`${API_URL}/inquiries`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              propertyId: property._id,
              message: inquiryMessage.trim(),
            }),
          });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send inquiry");
      }

      setInquirySuccess(
        "Your inquiry has been sent successfully. The seller can now respond to you.",
      );

      setInquiryMessage("");
    } catch (error) {
      console.error("Send inquiry error:", error);

      setInquiryError(error.message || "Something went wrong");
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="mb-6 h-5 w-32 rounded bg-slate-200" />

          <div className="grid gap-3 lg:grid-cols-[1.6fr_0.8fr]">
            <div className="h-[420px] rounded-2xl bg-slate-200" />

            <div className="grid grid-cols-2 gap-3">
              <div className="h-[205px] rounded-2xl bg-slate-200" />
              <div className="h-[205px] rounded-2xl bg-slate-200" />
              <div className="h-[205px] rounded-2xl bg-slate-200" />
              <div className="h-[205px] rounded-2xl bg-slate-200" />
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-slate-200" />
              <div className="h-5 w-1/2 rounded bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
            </div>

            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FiHome size={24} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Property not found
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">{error}</p>

          <Link
            to="/properties"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft size={15} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const images = Array.isArray(property.images) ? property.images : [];

  const seller = property.seller;

  const isSold = property.status === "sold";

  const isSeller =
    user &&
    seller &&
    user._id &&
    seller._id &&
    user._id.toString() === seller._id.toString();

  const isBuyer = user?.role === "buyer";

  const isInCompare = isCompared(property._id);

  const currentImage = images[selectedImage];

  const remainingImageCount = Math.max(images.length - 5, 0);

  const showMoreOverlay = images.length > 5;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Back navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <FiArrowLeft size={16} />
            Back to properties
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* =========================================================
            IMAGE GALLERY
        ========================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* =====================================================
              DESKTOP GALLERY — adaptive layout
          ====================================================== */}
          <div className="hidden lg:block">

            {/* ── 1 image: full-width cinematic hero ── */}
            {images.length === 1 && (
              <div className="relative h-[520px] w-full overflow-hidden bg-slate-100">
                <button
                  type="button"
                  onClick={() => openImageViewer(0)}
                  className="group block h-full w-full cursor-zoom-in"
                >
                  <img
                    src={images[0]?.url || FALLBACK_IMAGE}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                </button>
                {/* badges */}
                <div className="absolute left-4 top-4">
                  <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>
                    For {property.listingType}
                  </span>
                </div>
                {isSold && (
                  <div className="absolute right-4 top-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                      <FiCheckCircle size={13} /> Sold
                    </span>
                  </div>
                )}
                <button type="button" onClick={() => openImageViewer(0)} className="absolute bottom-4 right-4 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-900">
                  1 / 1
                </button>
              </div>
            )}

            {/* ── 2 images: 60/40 side-by-side ── */}
            {images.length === 2 && (
              <div className="grid h-[520px] grid-cols-[3fr_2fr] gap-1 bg-slate-100">
                {images.map((img, idx) => (
                  <button
                    key={img.publicId || idx}
                    type="button"
                    onClick={() => openImageViewer(idx)}
                    className="group relative overflow-hidden"
                  >
                    <img src={img.url || FALLBACK_IMAGE} alt={`${property.title} ${idx + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                    {idx === 0 && (
                      <>
                        <div className="absolute left-4 top-4">
                          <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>For {property.listingType}</span>
                        </div>
                        {isSold && (
                          <div className="absolute right-4 top-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"><FiCheckCircle size={13} /> Sold</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {/* ── 3 images: large left + 2 stacked right ── */}
            {images.length === 3 && (
              <div className="grid h-[520px] grid-cols-[3fr_2fr] gap-1 bg-slate-100">
                <button type="button" onClick={() => openImageViewer(0)} className="group relative overflow-hidden">
                  <img src={images[0]?.url || FALLBACK_IMAGE} alt={`${property.title} 1`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                  <div className="absolute left-4 top-4">
                    <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>For {property.listingType}</span>
                  </div>
                  {isSold && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"><FiCheckCircle size={13} /> Sold</span>
                    </div>
                  )}
                </button>
                <div className="grid grid-rows-2 gap-1">
                  {images.slice(1, 3).map((img, idx) => (
                    <button key={img.publicId || idx} type="button" onClick={() => openImageViewer(idx + 1)} className="group relative overflow-hidden">
                      <img src={img.url || FALLBACK_IMAGE} alt={`${property.title} ${idx + 2}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4 images: large left + 3 in right column ── */}
            {images.length === 4 && (
              <div className="grid h-[520px] grid-cols-[3fr_2fr] gap-1 bg-slate-100">
                <button type="button" onClick={() => openImageViewer(0)} className="group relative overflow-hidden">
                  <img src={images[0]?.url || FALLBACK_IMAGE} alt={`${property.title} 1`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                  <div className="absolute left-4 top-4">
                    <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>For {property.listingType}</span>
                  </div>
                  {isSold && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"><FiCheckCircle size={13} /> Sold</span>
                    </div>
                  )}
                </button>
                <div className="grid grid-rows-3 gap-1">
                  {images.slice(1, 4).map((img, idx) => (
                    <button key={img.publicId || idx} type="button" onClick={() => openImageViewer(idx + 1)} className="group relative overflow-hidden">
                      <img src={img.url || FALLBACK_IMAGE} alt={`${property.title} ${idx + 2}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5+ images: large left + 2×2 grid right with +N overlay ── */}
            {images.length >= 5 && (
              <div className="grid h-[520px] grid-cols-[1.6fr_0.8fr] gap-1 bg-slate-100">
                {/* Main image */}
                <button
                  type="button"
                  onClick={() => openImageViewer(selectedImage)}
                  className="group relative overflow-hidden"
                >
                  <img
                    src={currentImage?.url || FALLBACK_IMAGE}
                    alt={`${property.title} ${selectedImage + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute left-4 top-4">
                    <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>For {property.listingType}</span>
                  </div>
                  {isSold && (
                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"><FiCheckCircle size={13} /> Sold</span>
                    </div>
                  )}
                  {/* Prev / Next */}
                  <button type="button" onClick={(e) => { e.stopPropagation(); previousImage(); }} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                    <FiChevronLeft size={20} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                    <FiChevronRight size={20} />
                  </button>
                  <button type="button" onClick={() => openImageViewer(selectedImage)} className="absolute bottom-4 right-4 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-slate-900">
                    {selectedImage + 1} / {images.length}
                  </button>
                </button>
                {/* 2×2 thumbnails */}
                <div className="grid grid-cols-2 grid-rows-2 gap-1">
                  {images.slice(1, 5).map((img, idx) => {
                    const imageIndex = idx + 1;
                    const isMoreCard = idx === 3 && showMoreOverlay;
                    return (
                      <button
                        key={img.publicId || imageIndex}
                        type="button"
                        onClick={() => isMoreCard ? openImageViewer(imageIndex) : setSelectedImage(imageIndex)}
                        className={`group relative overflow-hidden ${selectedImage === imageIndex && !isMoreCard ? "ring-2 ring-blue-600 ring-inset" : ""}`}
                      >
                        <img src={img.url || FALLBACK_IMAGE} alt={`${property.title} ${imageIndex + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                        {isMoreCard && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 text-white transition group-hover:bg-slate-950/70">
                            <span className="text-2xl font-bold">+{remainingImageCount}</span>
                            <span className="mt-0.5 text-xs font-medium">More photos</span>
                          </div>
                        )}
                        {!isMoreCard && <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 transition group-hover:opacity-100" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =====================================================
              MOBILE GALLERY — main image + horizontal thumbs
          ====================================================== */}
          <div className="lg:hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <button
                type="button"
                onClick={() => openImageViewer(selectedImage)}
                className="group block h-full w-full cursor-zoom-in"
              >
                <img
                  src={currentImage?.url || FALLBACK_IMAGE}
                  alt={`${property.title} ${selectedImage + 1}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
              </button>
              <div className="absolute left-4 top-4">
                <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${property.listingType === "sale" ? "bg-blue-600" : "bg-slate-900"}`}>For {property.listingType}</span>
              </div>
              {isSold && (
                <div className="absolute right-4 top-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm"><FiCheckCircle size={13} /> Sold</span>
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button type="button" onClick={(e) => { e.stopPropagation(); previousImage(); }} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                    <FiChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                    <FiChevronRight size={18} />
                  </button>
                </>
              )}
              {images.length > 0 && (
                <button type="button" onClick={() => openImageViewer(selectedImage)} className="absolute bottom-3 right-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {selectedImage + 1} / {images.length}
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-white p-3">
                {images.map((img, index) => (
                  <button
                    key={img.publicId || index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ${selectedImage === index ? "ring-2 ring-blue-600 ring-offset-1" : ""}`}
                  >
                    <img src={img.url} alt={`${property.title} ${index + 1}`} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                    {index === selectedImage && <div className="absolute inset-0 bg-blue-600/10" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
            PROPERTY CONTENT
        ========================================================== */}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            {/* Property header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      {property.propertyType}
                    </span>

                    {isSold && (
                      <span className="rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-600">
                        Sold
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">
                    {property.title}
                  </h1>

                  <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                    <FiMapPin
                      className="mt-0.5 shrink-0 text-blue-600"
                      size={16}
                    />

                    <span>
                      {property.location?.address}, {property.location?.city},{" "}
                      {property.location?.district}
                    </span>
                  </p>
                </div>

                <div className="shrink-0 sm:text-right">
                  <p className="text-2xl font-extrabold text-blue-600">
                    {formatPrice(property.price, property.listingType)}
                  </p>

                  {property.listingType === "rent" && (
                    <p className="mt-1 text-xs text-slate-400">per month</p>
                  )}
                </div>
              </div>

              {/* Property stats */}
              <div className="mt-7 grid grid-cols-3 border-t border-slate-100 pt-6">
                <div className="flex flex-col items-center gap-2 border-r border-slate-100 px-2 text-center">
                  <MdBed className="text-blue-600" size={24} />

                  <span className="text-sm font-bold text-slate-900">
                    {property.bedrooms}
                  </span>

                  <span className="text-[11px] text-slate-400">Bedrooms</span>
                </div>

                <div className="flex flex-col items-center gap-2 border-r border-slate-100 px-2 text-center">
                  <MdBathtub className="text-blue-600" size={23} />

                  <span className="text-sm font-bold text-slate-900">
                    {property.bathrooms}
                  </span>

                  <span className="text-[11px] text-slate-400">Bathrooms</span>
                </div>

                <div className="flex flex-col items-center gap-2 px-2 text-center">
                  <FiSquare className="text-blue-600" size={20} />

                  <span className="text-sm font-bold text-slate-900">
                    {Number(property.area).toLocaleString("en-LK")}
                  </span>

                  <span className="text-[11px] text-slate-400">Sq Ft</span>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiHome size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    About this property
                  </h2>

                  <p className="text-xs text-slate-400">Property description</p>
                </div>
              </div>

              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {property.description}
              </p>
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiMapPin size={19} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Location & Map
                  </h2>

                  <p className="text-xs text-slate-400">
                    Exact address & map navigation
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {property.location?.address}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    City
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {property.location?.city}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    District
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {property.location?.district}
                  </p>
                </div>
              </div>

              {/* Interactive Map */}
              <LocationDisplayMap
                coordinates={property.location?.coordinates}
                address={property.location?.address}
                city={property.location?.city}
                district={property.location?.district}
                title={property.title}
              />
            </section>

            {/* Property information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-base font-bold text-slate-900">
                Property information
              </h2>

              <div className="mt-5 divide-y divide-slate-100">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Property type</span>

                  <span className="text-sm font-semibold capitalize text-slate-900">
                    {property.propertyType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Listing type</span>

                  <span className="text-sm font-semibold capitalize text-slate-900">
                    For {property.listingType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <MdBed size={19} className="text-slate-400" />
                    Bedrooms
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {property.bedrooms}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <MdBathtub size={18} className="text-slate-400" />
                    Bathrooms
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {property.bathrooms}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <FiSquare size={15} className="text-slate-400" />
                    Area
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {Number(property.area).toLocaleString("en-LK")} sq ft
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-500">Listed</span>

                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <FiClock size={14} className="text-slate-400" />

                    {new Date(property.createdAt).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* =========================================================
              SIDEBAR
          ========================================================== */}

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-5">
              {/* Seller */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Listed by
                </p>

                <div className="mt-4 flex items-center gap-3">
                  {seller?.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <FiUser size={21} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {seller?.name || "Property Seller"}
                    </h3>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Property owner
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  {seller?.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiMail size={14} className="shrink-0 text-slate-400" />

                      <span className="truncate">{seller.email}</span>
                    </div>
                  )}

                  {seller?.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FiPhone size={14} className="shrink-0 text-slate-400" />

                      <span>{seller.phone}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* =====================================================
                  COMPARE PROPERTY
              ====================================================== */}

              {!isSold && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isInCompare
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <FiBarChart2 size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Compare property
                      </h2>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Compare this property with another listing.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompare}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                      isInCompare
                        ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <FiBarChart2 size={16} />

                    {isInCompare ? "Remove from Compare" : "Add to Compare"}
                  </button>

                  {isInCompare && (
                    <p className="mt-3 text-center text-[11px] text-blue-600">
                      This property is currently selected for comparison.
                    </p>
                  )}
                </section>
              )}

              {/* Inquiry */}
              {!isSold && !isSeller && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiMessageSquare size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Interested in this property?
                      </h2>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Send a message directly to the seller.
                      </p>
                    </div>
                  </div>

                  {isBuyer ? (
                    <>
                      {!showInquiryForm && !inquirySuccess && (
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(true)}
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          <FiMessageSquare size={16} />
                          Contact Seller
                        </button>
                      )}

                      {showInquiryForm && (
                        <form onSubmit={handleSendInquiry} className="mt-5">
                          <label className="mb-2 flex items-center justify-between">
                            <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                              Your message
                            </span>

                            <span className="text-xs text-slate-400">
                              {inquiryMessage.length}/2000
                            </span>
                          </label>

                          <textarea
                            value={inquiryMessage}
                            onChange={(e) => {
                              setInquiryMessage(e.target.value);
                              setInquiryError("");
                              setInquirySuccess("");
                            }}
                            rows={5}
                            placeholder="Hi, I'm interested in this property. I'd like to know more about..."
                            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                          />

                          <div className="mt-2 flex items-center justify-between">
                            <span
                              className={`text-xs ${
                                inquiryMessage.trim().length < 5
                                  ? "text-slate-400"
                                  : "text-emerald-600"
                              }`}
                            >
                              {inquiryMessage.trim().length < 5
                                ? `Minimum 5 characters (${inquiryMessage.trim().length} so far)`
                                : "Message is valid"}
                            </span>
                          </div>

                          {inquiryError && (
                            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                              {inquiryError}
                            </div>
                          )}

                          {inquirySuccess && (
                            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-700">
                              {inquirySuccess}
                            </div>
                          )}

                          <div className="mt-3 flex gap-2">
                            {!inquirySuccess && (
                              <button
                                type="submit"
                                disabled={sendingInquiry}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <FiSend size={15} />

                                {sendingInquiry ? "Sending..." : "Send Inquiry"}
                              </button>
                            )}

                            {!inquirySuccess && (
                              <button
                                type="button"
                                onClick={() => setShowInquiryForm(false)}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                              >
                                <FiX size={17} />
                              </button>
                            )}
                          </div>

                          {inquirySuccess && (
                            <button
                              type="button"
                              onClick={() => {
                                setInquirySuccess("");
                                setShowInquiryForm(false);
                              }}
                              className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Close
                            </button>
                          )}
                        </form>
                      )}
                    </>
                  ) : (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs leading-relaxed text-slate-500">
                        Please log in as a buyer to send an inquiry to this
                        seller.
                      </p>

                      <Link
                        to="/login"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Log in
                        <FiArrowRight size={13} />
                      </Link>
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    <FiShield
                      className="mt-0.5 shrink-0 text-emerald-500"
                      size={15}
                    />

                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Your inquiry is sent directly to the seller through
                      EstateLanka.
                    </p>
                  </div>
                </section>
              )}

              {/* Sold */}
              {isSold && (
                <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <FiCheckCircle size={18} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Property Sold
                      </h2>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        This property is no longer available for new inquiries.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Browse properties */}
              <Link
                to="/properties"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FiHome size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Find another property
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Browse all listings
                    </p>
                  </div>
                </div>

                <FiArrowRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* ===========================================================
          FULL SCREEN IMAGE VIEWER
      ============================================================ */}

      {showImageViewer && images.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95">
          {/* Close */}
          <button
            type="button"
            onClick={() => setShowImageViewer(false)}
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <FiX size={22} />
          </button>

          {/* Counter */}
          <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            {selectedImage + 1} / {images.length}
          </div>

          {/* Main viewer image */}
          <div className="flex h-full items-center justify-center px-16 py-20 sm:px-24">
            <img
              src={images[selectedImage]?.url || FALLBACK_IMAGE}
              alt={`${property.title} ${selectedImage + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <FiChevronLeft size={25} />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <FiChevronRight size={25} />
            </button>
          )}

          {/* Viewer thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/30 p-2 backdrop-blur-md">
              {images.map((image, index) => (
                <button
                  key={image.publicId || index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ${
                    selectedImage === index
                      ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${property.title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;
