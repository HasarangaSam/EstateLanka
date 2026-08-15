import { useState } from "react";
import {
  FiDollarSign,
  FiMapPin,
  FiHome,
  FiDroplet,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const ML_API_URL = import.meta.env.VITE_ML_API_URL;

const PricePredictor = () => {
  const [formData, setFormData] = useState({
    district: "",
    area: "",
    perch: "",
    bedrooms: "",
    bathrooms: "",
    kitchen_area_sqft: "",
    parking_spots: "",
    has_garden: false,
    has_ac: false,
    water_supply: "",
    electricity: "",
    floors: "",
    year_built: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // DISTRICTS
  // ============================================================

  const districts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Mullaitivu",
    "Vavuniya",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
  ];

  // ============================================================
  // AREA OPTIONS
  // These come from the dataset used for training.
  // ============================================================

  const areas = [
    "Polonnaruwa Central",
    "Matale Central",
    "Mullaitivu Central",
    "New Town",
    "Batticaloa Town",
    "Beruwala",
    "Kuruwita",
    "Chunnakam",
    "Badulla Town",
    "Vavuniya Central",
    "Mannar Central",
    "Kilinochchi Central",
    "Hambantota Town",
    "Puttalam Central",
    "Ratnapura Town",
    "Pelmadulla",
    "Kandy City",
    "Ja-Ela",
    "Ampara Central",
    "Bandarawela",
    "Nuwaragam Palatha",
    "Jaffna Town",
    "Nilaveli",
    "Narahenpita",
    "Monaragala Central",
    "Uppuveli",
    "Peradeniya",
    "Unawatuna",
    "Matara Town",
    "Panadura",
    "Hali Ela",
    "Karapitiya",
    "Katugastota",
    "Kokuvil",
    "Nugegoda",
    "Ragama",
    "Wattala",
    "Weligama",
    "Gampaha Town",
    "Wellawatte",
    "Eravur",
    "Nuwara Eliya Central",
    "Kegalle Central",
    "Borella",
    "Melsiripura",
    "Madawachchiya",
    "Tangalle",
    "Bambalapitiya",
    "Nallur",
    "China Bay",
    "Kallady",
    "Rajagiriya",
    "Nupe",
    "Pannala",
    "Ambalantota",
    "Wadduwa",
    "Mount Lavinia",
    "Kadawatha",
    "Gatambe",
    "Kurunegala Town",
    "Dehiwala",
    "Kalutara North",
    "Kollupitiya",
    "Hikkaduwa",
    "Negombo",
    "Tennekumbura",
    "Galle Fort",
    "Akurugoda",
    "Polgahawela",
  ];

  // ============================================================
  // INPUT HANDLER
  // ============================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // FORMAT PRICE
  // ============================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-LK", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // ============================================================
  // PREDICT PRICE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setPrediction(null);
    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          district: formData.district,
          area: formData.area,
          perch: Number(formData.perch),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          kitchen_area_sqft: Number(formData.kitchen_area_sqft),
          parking_spots: Number(formData.parking_spots),
          has_garden: formData.has_garden,
          has_ac: formData.has_ac,
          water_supply: formData.water_supply,
          electricity: formData.electricity,
          floors: Number(formData.floors),
          year_built: Number(formData.year_built),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to generate price prediction");
      }

      setPrediction(data.predicted_price_lkr);
    } catch (error) {
      console.error("Price prediction error:", error);

      setError(
        error.message ||
          "Unable to connect to the house price prediction service.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setFormData({
      district: "",
      area: "",
      perch: "",
      bedrooms: "",
      bathrooms: "",
      kitchen_area_sqft: "",
      parking_spots: "",
      has_garden: false,
      has_ac: false,
      water_supply: "",
      electricity: "",
      floors: "",
      year_built: "",
    });

    setPrediction(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <section>
        <p className="text-sm font-medium text-blue-600">
          AI-Powered Property Tool
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          House Price Predictor
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Enter your property details and get an estimated market price using
          our Random Forest machine learning model trained on Sri Lankan
          property data.
        </p>
      </section>

      {/* ========================================================
          MAIN GRID
      ======================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ======================================================
            FORM
        ====================================================== */}

        <section className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiHome className="text-xl" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Property Information
                </h2>

                <p className="text-xs text-slate-500">
                  Enter the property features
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* ==================================================
                LOCATION
            ================================================== */}

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FiMapPin className="text-blue-600" />
                Location
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* District */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    District
                  </label>

                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select district</option>

                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Area
                  </label>

                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select area</option>

                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ==================================================
                PROPERTY DETAILS
            ================================================== */}

            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Property Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label="Land Size (Perches)"
                  name="perch"
                  type="number"
                  min="2"
                  max="80"
                  value={formData.perch}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Bedrooms"
                  name="bedrooms"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Bathrooms"
                  name="bathrooms"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Kitchen Area (sqft)"
                  name="kitchen_area_sqft"
                  type="number"
                  min="35"
                  max="250"
                  value={formData.kitchen_area_sqft}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Parking Spaces"
                  name="parking_spots"
                  type="number"
                  min="0"
                  max="3"
                  value={formData.parking_spots}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Number of Floors"
                  name="floors"
                  type="number"
                  min="1"
                  max="3"
                  value={formData.floors}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Year Built"
                  name="year_built"
                  type="number"
                  min="1985"
                  max="2025"
                  value={formData.year_built}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* ==================================================
                FACILITIES
            ================================================== */}

            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Facilities
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Water */}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FiDroplet className="text-blue-500" />
                    Water Supply
                  </label>

                  <select
                    name="water_supply"
                    value={formData.water_supply}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select water supply</option>
                    <option value="Pipe-borne">Pipe-borne</option>
                    <option value="Both">Both</option>
                    <option value="Well">Well</option>
                  </select>
                </div>

                {/* Electricity */}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FiZap className="text-blue-500" />
                    Electricity
                  </label>

                  <select
                    name="electricity"
                    value={formData.electricity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select electricity</option>
                    <option value="Single phase">Single phase</option>
                    <option value="Three phase">Three phase</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes */}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                  <input
                    type="checkbox"
                    name="has_garden"
                    checked={formData.has_garden}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Property has a garden
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                  <input
                    type="checkbox"
                    name="has_ac"
                    checked={formData.has_ac}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Property has air conditioning
                  </span>
                </label>
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

                <p>{error}</p>
              </div>
            )}

            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin text-lg" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <FiDollarSign className="text-lg" />
                    Predict House Price
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* ======================================================
            RESULT PANEL
        ====================================================== */}

        <section className="h-fit rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">
              Estimated Property Value
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Random Forest prediction
            </p>
          </div>

          <div className="p-6">
            {prediction !== null ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FiCheckCircle className="text-3xl" />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  Estimated Price
                </p>

                <p className="mt-2 break-words text-3xl font-bold tracking-tight text-slate-900">
                  LKR {formatPrice(prediction)}
                </p>

                <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left">
                  <p className="text-xs leading-5 text-slate-500">
                    This estimate is generated by the EstateLanka house price
                    prediction model based on the property features you entered.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiDollarSign className="text-2xl" />
                </div>

                <h3 className="mt-5 font-semibold text-slate-800">
                  No prediction yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Fill in the property details and click{" "}
                  <span className="font-medium text-slate-700">
                    Predict House Price
                  </span>{" "}
                  to get an estimated value.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================
          DISCLAIMER
      ======================================================== */}

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="mt-0.5 shrink-0 text-blue-600" />

          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              About this estimate
            </h3>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              The predicted price is an estimated value generated by a machine
              learning model trained on Sri Lankan property data. It should be
              used as a reference and may differ from the actual market value.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================
// REUSABLE INPUT
// ============================================================

const Input = ({ label, name, type, value, onChange, required, min, max }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
};

export default PricePredictor;
