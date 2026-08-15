import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiArrowRight,
  FiHeart,
  FiMaximize,
  FiImage,
  FiCheckCircle,
  FiTag,
  FiLoader,
  FiBarChart2,
} from "react-icons/fi";
import { MdBed, MdBathtub } from "react-icons/md";

import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

function PropertyCard({
  property,
  isInitiallyFavourite = false,
  user,
  accessToken,
}) {
  const { authFetch, accessToken: authToken } = useAuth();
  const activeToken = accessToken || authToken;

  const [isFavourite, setIsFavourite] = useState(isInitiallyFavourite);

  const [favouriteLoading, setFavouriteLoading] = useState(false);

  const { addPropertyToCompare, removePropertyFromCompare, isCompared } =
    useCompare();

  const isInCompare = isCompared(property._id);

  useEffect(() => {
    setIsFavourite(isInitiallyFavourite);
  }, [isInitiallyFavourite]);

  const getImageUrl = (image) => {
    if (!image) {
      return FALLBACK_IMAGE;
    }

    if (typeof image === "string") {
      return image;
    }

    return image.url || FALLBACK_IMAGE;
  };

  const imageCount = property.images?.length || 0;
  const firstImage = getImageUrl(property.images?.[0]);
  const isSold = property.status === "sold";

  const formatPrice = (price) => {
    return `Rs. ${Number(price).toLocaleString("en-LK")}`;
  };

  const handleFavourite = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSold) {
      alert("Sold properties cannot be added to favourites.");
      return;
    }

    if (!user) {
      alert("Please login as a buyer to add properties to favourites.");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can add properties to favourites.");
      return;
    }

    if (!accessToken) {
      alert("Your session has expired. Please login again.");
      return;
    }

    if (favouriteLoading) {
      return;
    }

    try {
      setFavouriteLoading(true);

      const method = isFavourite ? "DELETE" : "POST";

      const response = authFetch
        ? await authFetch(`${API_URL}/favourites/${property._id}`, { method })
        : await fetch(`${API_URL}/favourites/${property._id}`, {
          method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update favourite");
      }

      setIsFavourite((current) => !current);
    } catch (error) {
      console.error("Favourite error:", error);

      alert(
        error.message || "Something went wrong while updating your favourites.",
      );
    } finally {
      setFavouriteLoading(false);
    }
  };

  const handleCompare = (event) => {
    // Prevent this button click from affecting the property card.
    event.preventDefault();
    event.stopPropagation();

    if (isSold) {
      alert("Sold properties cannot be added to compare.");
      return;
    }

    if (isInCompare) {
      removePropertyFromCompare(property._id);
      return;
    }

    const result = addPropertyToCompare(property._id);

    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={firstImage}
          alt={property.title || "Property"}
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${isSold ? "grayscale-[30%]" : ""
            }`}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg ${property.listingType === "sale" ? "bg-blue-600" : "bg-violet-600"
              }`}
          >
            <FiTag size={10} />
            For {property.listingType}
          </span>
        </div>

        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30">
            <span className="rounded-lg bg-slate-900/90 px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-white">
              Sold
            </span>
          </div>
        )}

        {/* ==================================================
    ACTION BUTTONS
================================================== */}

        <div className="absolute right-3 top-3 flex items-center gap-2">
          {/* Compare button */}

          <button
            type="button"
            onClick={handleCompare}
            aria-label={
              isInCompare
                ? "Remove property from comparison"
                : "Add property to comparison"
            }
            title={isInCompare ? "Remove from comparison" : "Add to comparison"}
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${isInCompare
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white/90 text-slate-600 hover:bg-white hover:text-blue-600"
              }`}
          >
            <FiBarChart2 size={16} />
          </button>

          {/* Favourite button */}

          <button
            type="button"
            onClick={handleFavourite}
            disabled={favouriteLoading}
            aria-label={
              isFavourite
                ? "Remove property from favourites"
                : "Add property to favourites"
            }
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
            className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${isFavourite
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white/90 text-slate-600 hover:bg-white hover:text-red-500"
              } ${favouriteLoading ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {favouriteLoading ? (
              <FiLoader size={16} className="animate-spin" />
            ) : (
              <FiHeart
                size={16}
                className={isFavourite ? "fill-current" : ""}
              />
            )}
          </button>
        </div>

        {imageCount > 1 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <FiImage size={11} />
            <span>{imageCount}</span>
            <span className="hidden sm:inline">photos</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3">
          <p className="font-heading text-lg font-extrabold tracking-tight text-white drop-shadow-lg">
            {formatPrice(property.price)}
          </p>

          {property.listingType === "rent" && (
            <p className="text-right text-[10px] font-medium text-white/80">
              per month
            </p>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            {property.propertyType}
          </span>

          {property.status === "approved" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <FiCheckCircle size={11} />
              Available
            </span>
          )}
        </div>

        <h2 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-blue-600">
          {property.title}
        </h2>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
          <FiMapPin size={12} className="shrink-0 text-slate-400" />

          <span className="line-clamp-1">
            {property.location?.city || "Unknown city"}
            {property.location?.district
              ? `, ${property.location.district}`
              : ""}
          </span>
        </p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <MdBed size={14} className="text-slate-400" />
            <span>{property.bedrooms}</span>
            <span className="text-slate-400">Beds</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <MdBathtub size={14} className="text-slate-400" />
            <span>{property.bathrooms}</span>
            <span className="text-slate-400">Baths</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <FiMaximize size={14} className="text-slate-400" />
            <span>{property.area}</span>
            <span className="text-slate-400">sqft</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] font-medium capitalize text-slate-400">
            {property.propertyType}
          </span>

          <Link
            to={`/properties/${property._id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
          >
            View property
            <FiArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
