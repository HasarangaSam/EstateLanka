import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiSliders,
  FiX,
} from "react-icons/fi";

import PropertyCard from "../components/PropertyCard";
import FilterForm from "../components/FilterForm";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, accessToken } = useAuth();

  // --------------------------------------------------
  // Filter state
  // --------------------------------------------------

  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [district, setDistrict] = useState(searchParams.get("district") || "");

  const [city, setCity] = useState(searchParams.get("city") || "");

  const [propertyType, setPropertyType] = useState(
    searchParams.get("propertyType") || "",
  );

  const [listingType, setListingType] = useState(
    searchParams.get("listingType") || "",
  );

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");

  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");

  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") || "",
  );

  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // --------------------------------------------------
  // Page state
  // --------------------------------------------------

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [properties, setProperties] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProperties: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // Fetch properties
  // --------------------------------------------------

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        if (search.trim()) {
          query.append("search", search.trim());
        }

        if (district) {
          query.append("district", district);
        }

        if (city.trim()) {
          query.append("city", city.trim());
        }

        if (propertyType) {
          query.append("propertyType", propertyType);
        }

        if (listingType) {
          query.append("listingType", listingType);
        }

        if (minPrice) {
          query.append("minPrice", minPrice);
        }

        if (maxPrice) {
          query.append("maxPrice", maxPrice);
        }

        if (bedrooms) {
          query.append("bedrooms", bedrooms);
        }

        if (bathrooms) {
          query.append("bathrooms", bathrooms);
        }

        query.append("sort", sort);
        query.append("page", page);
        query.append("limit", 12);

        // Keep filters in URL
        setSearchParams(query, { replace: true });

        const response = await fetch(
          `${API_URL}/properties?${query.toString()}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load properties");
        }

        setProperties(data.properties || []);

        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Fetch properties error:", err);

        setError(
          err.message || "Something went wrong while loading properties.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [
    search,
    district,
    city,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    sort,
    page,
    setSearchParams,
  ]);

  // --------------------------------------------------
  // Reset filters
  // --------------------------------------------------

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    setCity("");
    setPropertyType("");
    setListingType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setSort("newest");
    setPage(1);
  };

  // --------------------------------------------------
  // Active filter count
  // --------------------------------------------------

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (search) count++;
    if (district) count++;
    if (city) count++;
    if (propertyType) count++;
    if (listingType) count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (bedrooms) count++;
    if (bathrooms) count++;

    return count;
  }, [
    search,
    district,
    city,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
  ]);

  // --------------------------------------------------
  // Skeleton
  // --------------------------------------------------

  const PropertySkeleton = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="skeleton-shimmer aspect-[4/3]" />

      <div className="space-y-4 p-4">
        <div className="skeleton-shimmer h-3 w-20 rounded" />

        <div className="skeleton-shimmer h-5 w-4/5 rounded" />

        <div className="skeleton-shimmer h-3 w-1/2 rounded" />

        <div className="skeleton-shimmer h-12 w-full rounded" />

        <div className="skeleton-shimmer h-4 w-28 rounded" />
      </div>
    </div>
  );

  // --------------------------------------------------
  // Common FilterForm props
  // --------------------------------------------------

  const filterProps = {
    search,
    setSearch,

    district,
    setDistrict,

    city,
    setCity,

    propertyType,
    setPropertyType,

    listingType,
    setListingType,

    minPrice,
    setMinPrice,

    maxPrice,
    setMaxPrice,

    bedrooms,
    setBedrooms,

    bathrooms,
    setBathrooms,

    setPage,

    activeFilterCount,
    handleReset,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* ==================================================
            MOBILE HEADER
        ================================================== */}

        <div className="mb-5 flex items-center justify-between lg:hidden">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {pagination.totalProperties} Properties
            </p>

            <p className="text-xs text-slate-500">Available across Sri Lanka</p>
          </div>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
          >
            <FiSliders size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ==================================================
            MOBILE FILTER OVERLAY
        ================================================== */}

        {mobileFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* ==================================================
            MOBILE FILTER DRAWER
        ================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-[60] w-[310px] max-w-[88vw] overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${mobileFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Filters</h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Refine your search
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
            >
              <FiX size={18} />
            </button>
          </div>

          <FilterForm {...filterProps} />

          <button
            type="button"
            onClick={() => setMobileFilterOpen(false)}
            className="mt-8 w-full rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Show {pagination.totalProperties} Results
          </button>
        </aside>

        {/* ==================================================
            MAIN LAYOUT
        ================================================== */}

        <div className="flex gap-8">
          {/* ==================================================
              DESKTOP FILTER SIDEBAR
          ================================================== */}

          <aside className="hidden w-64 shrink-0 self-start lg:block xl:w-72">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <FilterForm {...filterProps} />
            </div>
          </aside>

          {/* ==================================================
              PROPERTY CONTENT
          ================================================== */}

          <main className="min-w-0 flex-1">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Properties
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {loading
                    ? "Finding properties..."
                    : `${pagination.totalProperties} properties found`}
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
                  Sort by
                </span>

                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-500"
                >
                  <option value="newest">Newest</option>

                  <option value="oldest">Oldest</option>

                  <option value="price-low">Price: Low to High</option>

                  <option value="price-high">Price: High to Low</option>

                  <option value="bedrooms">Most Bedrooms</option>
                </select>
              </div>
            </div>

            {/* ==================================================
                ACTIVE FILTERS
            ================================================== */}

            {activeFilterCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filters:
                </span>

                {search && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    Search: {search}
                  </span>
                )}

                {listingType && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    {listingType === "sale" ? "For Sale" : "For Rent"}
                  </span>
                )}

                {propertyType && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold capitalize text-blue-700">
                    {propertyType}
                  </span>
                )}

                {district && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    {district}
                  </span>
                )}

                {city && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    {city}
                  </span>
                )}

                {minPrice && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    Min: LKR {Number(minPrice).toLocaleString("en-LK")}
                  </span>
                )}

                {maxPrice && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    Max: LKR {Number(maxPrice).toLocaleString("en-LK")}
                  </span>
                )}

                {bedrooms && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    {bedrooms}+ bedrooms
                  </span>
                )}

                {bathrooms && (
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-700">
                    {bathrooms}+ bathrooms
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[10px] font-bold text-slate-500 underline underline-offset-2 transition hover:text-slate-800"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PropertySkeleton key={index} />
                ))}
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <FiX size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-red-900">
                  Unable to load properties
                </h3>

                <p className="mt-1 text-xs text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!loading && !error && properties.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiHome size={26} />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  No properties found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                  We couldn't find properties matching your current search. Try
                  changing your location or clearing some filters.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* ==================================================
                PROPERTY GRID
            ================================================== */}

            {!loading && !error && properties.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    user={user}
                    accessToken={accessToken}
                  />
                ))}
              </div>
            )}

            {/* ==================================================
                PAGINATION
            ================================================== */}

            {!loading && !error && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                  {/* Previous */}
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(current - 1, 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  {/* Page number */}
                  <div className="px-3 text-center">
                    <p className="text-xs font-bold text-slate-900">
                      {pagination.currentPage}

                      <span className="mx-1 text-slate-300">/</span>

                      {pagination.totalPages}
                    </p>

                    <p className="text-[9px] uppercase tracking-wider text-slate-400">
                      Page
                    </p>
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(current + 1, pagination.totalPages),
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Properties;
