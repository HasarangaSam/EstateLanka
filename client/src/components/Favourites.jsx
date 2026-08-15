import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiLogIn,
  FiHome,
  FiArrowRight,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../context/AuthContext.jsx";

// ------------------------------------------------------------
// API URL
// ------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL;

// ------------------------------------------------------------
// Favourites Page
// ------------------------------------------------------------

function Favourites({ user: userProp, accessToken: accessTokenProp } = {}) {
  const { user: authUser, accessToken: authToken, authFetch } = useAuth();
  const user = userProp ?? authUser;
  const accessToken = accessTokenProp ?? authToken;

  const [favourites, setFavourites] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // Get buyer's favourites
  // ----------------------------------------------------------

  useEffect(() => {
    const fetchFavourites = async () => {
      // --------------------------------------------------------
      // If there is no logged-in user, there is nothing to fetch.
      // --------------------------------------------------------

      if (!user) {
        setLoading(false);
        return;
      }

      // --------------------------------------------------------
      // Only buyers can have favourites.
      // --------------------------------------------------------

      if (user.role !== "buyer") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // ------------------------------------------------------
        // Request logged-in buyer's favourites using authFetch
        // (automatically retries with refreshed token on 401).
        // ------------------------------------------------------

        const response = authFetch
          ? await authFetch(`${API_URL}/favourites`)
          : await fetch(`${API_URL}/favourites`, {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            });

        const data = await response.json();

        // ------------------------------------------------------
        // Backend returned an error.
        // ------------------------------------------------------

        if (!response.ok) {
          throw new Error(data.message || "Failed to load your favourites");
        }

        // ------------------------------------------------------
        // Store favourites.
        // ------------------------------------------------------

        setFavourites(data.favourites || []);
      } catch (error) {
        console.error("Get favourites error:", error);

        setError(
          error.message ||
            "Something went wrong while loading your favourites.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [user, accessToken]);

  // ------------------------------------------------------------
  // Remove a favourite from the page
  //
  // PropertyCard already performs the DELETE request.
  //
  // We use this function when the favourite button is clicked
  // so the removed property disappears from this page.
  // ------------------------------------------------------------

  const handleFavouriteChange = (propertyId, isFavourite) => {
    if (!isFavourite) {
      setFavourites((current) =>
        current.filter((favourite) => favourite.property?._id !== propertyId),
      );
    }
  };

  // ------------------------------------------------------------
  // User is not logged in
  // ------------------------------------------------------------

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            {/* Icon */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiHeart size={34} />
            </div>

            {/* Heading */}

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              Your favourites are waiting
            </h1>

            {/* Description */}

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Login as a buyer to save properties you love and easily find them
              again later.
            </p>

            {/* Login button */}

            <Link
              to="/login"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <FiLogIn size={16} />
              Login as Buyer
              <FiArrowRight size={15} />
            </Link>

            {/* Browse properties */}

            <Link
              to="/properties"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Logged-in user is not a buyer
  // ------------------------------------------------------------

  if (!loading && user && user.role !== "buyer") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            {/* Icon */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiHeart size={34} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              Buyer account required
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Favourites are available for buyer accounts. Login with a buyer
              account to save and manage properties.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Browse Properties
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Header skeleton */}

          <div className="mb-8">
            <div className="skeleton-shimmer h-7 w-36 rounded" />

            <div className="mt-2 skeleton-shimmer h-4 w-64 rounded" />
          </div>

          {/* Property skeletons */}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="skeleton-shimmer aspect-[4/3]" />

                <div className="space-y-4 p-4">
                  <div className="skeleton-shimmer h-3 w-20 rounded" />

                  <div className="skeleton-shimmer h-5 w-4/5 rounded" />

                  <div className="skeleton-shimmer h-3 w-1/2 rounded" />

                  <div className="skeleton-shimmer h-12 w-full rounded" />

                  <div className="skeleton-shimmer h-4 w-28 rounded" />
                </div>
              </div>
            ))}
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
              <FiX size={20} />
            </div>

            <h2 className="mt-4 text-sm font-bold text-red-900">
              Unable to load favourites
            </h2>

            <p className="mt-1 text-xs text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
            >
              <FiRefreshCw size={13} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Empty favourites
  // ------------------------------------------------------------

  if (favourites.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            {/* Icon */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-400">
              <FiHeart size={34} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              No favourites yet
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Start exploring properties and tap the heart icon on properties
              you would like to save.
            </p>

            <Link
              to="/properties"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Explore Properties
              <FiArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Favourites page
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <FiHeart size={17} className="fill-current" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My Favourites
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Properties you have saved for later.
            </p>
          </div>

          {/* Favourite count */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-xs font-bold text-slate-900">
              {favourites.length}{" "}
              {favourites.length === 1 ? "Property" : "Properties"}
            </p>

            <p className="text-[10px] text-slate-400">Saved favourites</p>
          </div>
        </div>

        {/* ======================================================
            PROPERTY GRID
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((favourite) => {
            const property = favourite.property;

            // --------------------------------------------------
            // Protect against a favourite whose property was
            // deleted or no longer exists.
            // --------------------------------------------------

            if (!property) {
              return null;
            }

            return (
              <PropertyCard
                key={favourite._id}
                property={property}
                isInitiallyFavourite={true}
                user={user}
                accessToken={accessToken}
                onFavouriteChange={handleFavouriteChange}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Favourites;
