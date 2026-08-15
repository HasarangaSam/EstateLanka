import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiBarChart2,
  FiHome,
  FiMapPin,
  FiTrash2,
} from "react-icons/fi";
import { MdBed, MdBathtub } from "react-icons/md";

import { useCompare } from "../context/CompareContext";

const API_URL = import.meta.env.VITE_API_URL;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

function CompareProperties() {
  const { compareIds, removePropertyFromCompare, clearCompare } = useCompare();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // Fetch compared properties
  // ------------------------------------------------------------

  useEffect(() => {
    const fetchComparedProperties = async () => {
      if (compareIds.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Fetch each selected property by ID.
        const responses = await Promise.all(
          compareIds.map((propertyId) =>
            fetch(`${API_URL}/properties/${propertyId}`),
          ),
        );

        const validProperties = [];
        const invalidPropertyIds = [];

        await Promise.all(
          responses.map(async (response, index) => {
            const propertyId = compareIds[index];
            const result = await response.json();

            if (response.ok && result.property && result.property.status === "approved") {
              validProperties.push(result.property);
            } else {
              invalidPropertyIds.push(propertyId);
            }
          }),
        );

        // Remove any sold or deleted properties from local comparison state
        invalidPropertyIds.forEach((id) => removePropertyFromCompare(id));

        setProperties(validProperties);
      } catch (error) {
        console.error("Fetch comparison properties error:", error);

        setError(
          error.message || "Something went wrong while loading properties.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComparedProperties();
  }, [compareIds]);

  // ------------------------------------------------------------
  // Remove one property
  // ------------------------------------------------------------

  const handleRemove = (propertyId) => {
    removePropertyFromCompare(propertyId);
  };

  // ------------------------------------------------------------
  // Clear all properties
  // ------------------------------------------------------------

  const handleClearAll = () => {
    clearCompare();
  };

  // ------------------------------------------------------------
  // Format price
  // ------------------------------------------------------------

  const formatPrice = (price) => {
    return `LKR ${Number(price).toLocaleString("en-LK")}`;
  };

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-5 w-32 rounded bg-slate-200" />

            <div className="mt-4 h-9 w-72 rounded bg-slate-200" />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="h-[500px] rounded-2xl bg-slate-200" />
              <div className="h-[500px] rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error state
  // ------------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiBarChart2 size={24} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load comparison
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {error}
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiArrowLeft size={15} />
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------

  if (compareIds.length === 0 || properties.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FiBarChart2 size={28} />
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-slate-900">
              No properties to compare
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Add two properties to your comparison list to see their details
              side by side.
            </p>

            <Link
              to="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <FiHome size={16} />
              Browse Properties
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* ========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                <FiArrowLeft size={15} />
                Back to properties
              </Link>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiBarChart2 size={20} />
                </div>

                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    Compare Properties
                  </h1>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Compare your selected properties side by side
                  </p>
                </div>
              </div>
            </div>

            {/* Clear button */}

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              <FiTrash2 size={14} />
              Clear comparison
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT
      ========================================================= */}

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Comparison count */}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-600">
            {properties.length}{" "}
            {properties.length === 1 ? "property" : "properties"} selected
          </p>

          {properties.length < 2 && (
            <Link
              to="/properties"
              className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
            >
              Add another property
            </Link>
          )}
        </div>

        {/* ======================================================
            COMPARISON GRID
        ======================================================= */}

        <div
          className={`grid gap-5 ${
            properties.length === 1 ? "mx-auto max-w-xl" : "md:grid-cols-2"
          }`}
        >
          {properties.map((property) => {
            const image =
              property.images?.[0]?.url ||
              property.images?.[0] ||
              FALLBACK_IMAGE;

            const isSold = property.status === "sold";

            return (
              <article
                key={property._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* ==================================================
                    PROPERTY IMAGE
                ================================================== */}

                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={image}
                    alt={property.title || "Property"}
                    className={`h-full w-full object-cover ${
                      isSold ? "grayscale-[30%]" : ""
                    }`}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />

                  {/* Listing type */}

                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow ${
                        property.listingType === "sale"
                          ? "bg-blue-600"
                          : "bg-violet-600"
                      }`}
                    >
                      For {property.listingType}
                    </span>
                  </div>

                  {/* Sold */}

                  {isSold && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                        Sold
                      </span>
                    </div>
                  )}

                  {/* Remove */}

                  <button
                    type="button"
                    onClick={() => handleRemove(property._id)}
                    title="Remove from comparison"
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-sm backdrop-blur transition hover:bg-red-50 hover:text-red-600"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>

                {/* ==================================================
                    PROPERTY HEADER
                ================================================== */}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        {property.propertyType}
                      </span>

                      <h2 className="mt-1.5 text-lg font-extrabold leading-tight text-slate-900">
                        {property.title}
                      </h2>

                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <FiMapPin
                          size={13}
                          className="shrink-0 text-blue-500"
                        />

                        <span className="line-clamp-1">
                          {property.location?.city || "Unknown city"}
                          {property.location?.district
                            ? `, ${property.location.district}`
                            : ""}
                        </span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-extrabold text-blue-600">
                        {formatPrice(property.price)}
                      </p>

                      {property.listingType === "rent" && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          per month
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                      COMPARISON INFORMATION
                  ================================================== */}

                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
                    {/* Property type */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Property Type
                      </span>

                      <span className="text-xs font-bold capitalize text-slate-900">
                        {property.propertyType}
                      </span>
                    </div>

                    {/* Listing type */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Listing Type
                      </span>

                      <span className="text-xs font-bold capitalize text-slate-900">
                        For {property.listingType}
                      </span>
                    </div>

                    {/* Bedrooms */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <MdBed size={17} className="text-slate-400" />
                        Bedrooms
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {property.bedrooms}
                      </span>
                    </div>

                    {/* Bathrooms */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="flex items-center gap-2 text-xs text-slate-500">
                        <MdBathtub size={17} className="text-slate-400" />
                        Bathrooms
                      </span>

                      <span className="text-xs font-bold text-slate-900">
                        {property.bathrooms}
                      </span>
                    </div>

                    {/* Area */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs text-slate-500">Area</span>

                      <span className="text-xs font-bold text-slate-900">
                        {Number(property.area).toLocaleString("en-LK")} sq ft
                      </span>
                    </div>

                    {/* Location */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs text-slate-500">District</span>

                      <span className="text-xs font-bold text-slate-900">
                        {property.location?.district || "-"}
                      </span>
                    </div>

                    {/* Availability */}

                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-xs text-slate-500">
                        Availability
                      </span>

                      {isSold ? (
                        <span className="text-xs font-bold text-red-600">
                          Sold
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <FiCheckCircle size={13} />
                          Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ==================================================
                      VIEW PROPERTY
                  ================================================== */}

                  <Link
                    to={`/properties/${property._id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    View property
                    <FiArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* ======================================================
            BOTTOM INFORMATION
        ======================================================= */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
              <FiBarChart2 size={17} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Compare properties easily
              </h3>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Compare price, property type, bedrooms, bathrooms, area,
                location, and availability before deciding which property is
                right for you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CompareProperties;
