import { FiMapPin, FiRefreshCw, FiSliders } from "react-icons/fi";

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

function FilterForm({
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
}) {
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FiSliders size={15} />
            Refine Results
          </h3>

          <p className="mt-1 text-[11px] text-slate-400">
            Narrow down your property search
          </p>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <FiRefreshCw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Search
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          placeholder="Search properties..."
          className={inputClass}
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Location
        </label>

        <div className="space-y-2.5">
          {/* City */}
          <div className="relative">
            <FiMapPin
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={city}
              onChange={(e) => handleFilterChange(setCity, e.target.value)}
              placeholder="Search by city"
              className={`${inputClass} pl-10`}
            />
          </div>

          {/* District */}
          <select
            value={district}
            onChange={(e) => handleFilterChange(setDistrict, e.target.value)}
            className={inputClass}
          >
            <option value="">All districts</option>

            {SRI_LANKAN_DISTRICTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Property Type
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                setPropertyType,
                propertyType === "house" ? "" : "house",
              )
            }
            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${propertyType === "house"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
          >
            House
          </button>

          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                setPropertyType,
                propertyType === "apartment" ? "" : "apartment",
              )
            }
            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${propertyType === "apartment"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
          >
            Apartment
          </button>
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Listing
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                setListingType,
                listingType === "sale" ? "" : "sale",
              )
            }
            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${listingType === "sale"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
          >
            For Sale
          </button>

          <button
            type="button"
            onClick={() =>
              handleFilterChange(
                setListingType,
                listingType === "rent" ? "" : "rent",
              )
            }
            className={`rounded-xl border px-3 py-3 text-xs font-semibold transition ${listingType === "rent"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
          >
            For Rent
          </button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Price Range · LKR
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
            placeholder="Minimum"
            className={inputClass}
          />

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
            placeholder="Maximum"
            className={inputClass}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Minimum Bedrooms
        </label>

        <div className="grid grid-cols-4 gap-2">
          {["1", "2", "3", "4"].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() =>
                handleFilterChange(
                  setBedrooms,
                  bedrooms === number ? "" : number,
                )
              }
              className={`rounded-xl border py-2.5 text-xs font-semibold transition ${bedrooms === number
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
            >
              {number}+
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Minimum Bathrooms
        </label>

        <div className="grid grid-cols-4 gap-2">
          {["1", "2", "3", "4"].map((number) => (
            <button
              key={number}
              type="button"
              onClick={() =>
                handleFilterChange(
                  setBathrooms,
                  bathrooms === number ? "" : number,
                )
              }
              className={`rounded-xl border py-2.5 text-xs font-semibold transition ${bathrooms === number
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
            >
              {number}+
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterForm;
