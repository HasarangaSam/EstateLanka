import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiHome,
  FiCheckCircle,
  FiShield,
  FiUsers,
  FiArrowRight,
  FiHeart,
  FiKey,
  FiStar,
  FiPhone,
  FiTrendingUp,
  FiBarChart2,
  FiDollarSign,
} from "react-icons/fi";

import colomboImg from "../assets/colombo.jpg";
import kandyImg from "../assets/kandy.jpg";
import galleImg from "../assets/galle.jpg";
import gampahaImg from "../assets/gampaha.jpg";

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

const popularLocations = [
  {
    name: "Colombo",
    subtitle: "City living & apartments",
    image: colomboImg,
  },
  {
    name: "Kandy",
    subtitle: "Homes surrounded by hills",
    image: kandyImg,
  },
  {
    name: "Galle",
    subtitle: "Coastal homes & properties",
    image: galleImg,
  },
  {
    name: "Gampaha",
    subtitle: "Family homes near Colombo",
    image: gampahaImg,
  },
];

const testimonials = [
  {
    name: "Nadeesha Perera",
    role: "Home Buyer",
    location: "Colombo",
    text: "EstateLanka made it much easier to compare properties without spending hours searching through different listings.",
  },
  {
    name: "Kasun Fernando",
    role: "Property Seller",
    location: "Gampaha",
    text: "Listing my property was straightforward, and I started receiving genuine inquiries from interested buyers.",
  },
  {
    name: "Tharushi Silva",
    role: "Apartment Buyer",
    location: "Kandy",
    text: "I liked how simple the search was. Being able to filter by district and property type saved me a lot of time.",
  },
];

/* ============================================================
   COUNT UP
============================================================ */

function AnimatedNumber({ value, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [started, value, duration]);

  return (
    <>
      {count.toLocaleString("en-LK")}
      {suffix}
    </>
  );
}

/* ============================================================
   HOME
============================================================ */

function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [district, setDistrict] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     FETCH FEATURED PROPERTIES
  ============================================================ */

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/properties?limit=6&sort=newest`);

        const data = await res.json();

        if (res.ok) {
          setFeaturedProperties(data.properties || []);
        }
      } catch (err) {
        console.error("Could not load featured properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    if (district) {
      params.append("district", district);
    }

    if (propertyType) {
      params.append("propertyType", propertyType);
    }

    navigate(`/properties?${params.toString()}`);
  };

  /* ============================================================
     PRICE FORMAT
  ============================================================ */

  const formatPrice = (price, type) => {
    const formatted = Number(price).toLocaleString("en-LK");

    return type === "rent" ? `LKR ${formatted} / mo` : `LKR ${formatted}`;
  };

  return (
    <div className="bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[680px] overflow-hidden lg:min-h-[720px]">
        <img
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=85"
          alt="Modern Sri Lankan style home"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/55" />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-slate-950/20" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:min-h-[720px] lg:px-8">
          <div className="w-full max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-300 sm:text-sm font-heading">
              Sri Lanka's property marketplace
            </p>

            <h1 className="font-heading max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find a place that feels like{" "}
              <span className="font-serif-accent italic font-normal text-blue-300">home.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Discover houses and apartments for sale and rent across Sri Lanka.
              Search by location, explore properties, and connect with sellers
              directly.
            </p>

            {/* SEARCH */}

            <div className="mt-9 max-w-4xl rounded-2xl bg-white p-3 shadow-2xl sm:p-4">
              <form onSubmit={handleSearch}>
                <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
                  <div className="relative">
                    <FiSearch
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search city or property..."
                      className="
                        h-12 w-full rounded-xl
                        border border-slate-200
                        bg-white
                        pl-11 pr-4
                        text-sm text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/10
                      "
                    />
                  </div>

                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-white
                      px-4
                      text-sm text-slate-700
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                    "
                  >
                    <option value="">All Districts</option>

                    {SRI_LANKAN_DISTRICTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="
                      h-12 w-full rounded-xl
                      border border-slate-200
                      bg-white
                      px-4
                      text-sm text-slate-700
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-500/10
                    "
                  >
                    <option value="">Property Type</option>

                    <option value="house">House</option>

                    <option value="apartment">Apartment</option>
                  </select>

                  <button
                    type="submit"
                    className="
                      flex h-12 items-center justify-center gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      text-sm font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      focus:ring-offset-2
                    "
                  >
                    <FiSearch size={17} />
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
                <span className="mr-1 text-xs text-slate-400">Popular:</span>

                <button
                  type="button"
                  onClick={() => navigate("/properties?listingType=sale")}
                  className="
                    rounded-full
                    border border-slate-200
                    px-3 py-1.5
                    text-xs font-medium
                    text-slate-600
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >
                  Properties for Sale
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/properties?listingType=rent")}
                  className="
                    rounded-full
                    border border-slate-200
                    px-3 py-1.5
                    text-xs font-medium
                    text-slate-600
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >
                  Properties for Rent
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/properties?propertyType=apartment")}
                  className="
                    rounded-full
                    border border-slate-200
                    px-3 py-1.5
                    text-xs font-medium
                    text-slate-600
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                  "
                >
                  Apartments
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANIMATED STATS
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 lg:grid-cols-4 lg:divide-y-0">
            <div className="px-5 py-8 text-center sm:px-8">
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                <AnimatedNumber value={1000} suffix="+" />
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                Properties Listed
              </p>
            </div>

            <div className="px-5 py-8 text-center sm:px-8">
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                <AnimatedNumber value={500} suffix="+" />
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                Active Sellers
              </p>
            </div>

            <div className="px-5 py-8 text-center sm:px-8">
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                <AnimatedNumber value={25} />
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                Sri Lankan Districts
              </p>
            </div>

            <div className="px-5 py-8 text-center sm:px-8">
              <p className="flex items-center justify-center gap-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                <AnimatedNumber value={48} suffix="/10" />
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">
                User Experience Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-4 px-4 py-7 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiShield size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Trusted listings
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Properties reviewed through our platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-7 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiMapPin size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  All across Sri Lanka
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Search properties across all 25 districts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-7 sm:px-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <FiUsers size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Connect directly
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Communicate with sellers through EstateLanka
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED PROPERTIES
      ====================================================== */}

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Recently listed
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Properties worth seeing
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Take a look at some of the latest houses and apartments
                available on EstateLanka.
              </p>
            </div>

            <Link
              to="/properties"
              className="
                inline-flex shrink-0 items-center gap-2
                text-sm font-semibold
                text-blue-600
                transition
                hover:text-blue-700
              "
            >
              View all properties
              <FiArrowRight size={15} />
            </Link>
          </div>

          {loading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="h-52 animate-pulse bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />

                    <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredProperties.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}

          {!loading && featuredProperties.length === 0 && (
            <div className="mt-10 rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <FiHome className="mx-auto h-9 w-9 text-slate-300" />

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No properties available yet
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                New listings will appear here as sellers add their properties.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MACHINE LEARNING PROPERTY VALUE ESTIMATION
      ====================================================== */}

      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid lg:grid-cols-[1fr_1.15fr]">
              {/* LEFT */}

              <div className="bg-slate-900 p-8 sm:p-10 lg:p-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FiBarChart2 size={22} />
                </div>

                <p className="mt-7 text-sm font-semibold text-blue-400">
                  Machine Learning Powered
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Know the potential value of your property
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                  Sellers can use EstateLanka's machine learning powered
                  property value estimation feature to get an estimated market
                  value before creating a listing.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                      <FiTrendingUp size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Data-driven estimation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        The model uses important property characteristics to
                        estimate a suitable market value.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                      <FiMapPin size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Sri Lankan market focused
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        District-level information helps the model understand
                        differences across the local property market.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
                      <FiDollarSign size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Better listing decisions
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Sellers can use the estimated value as a reference when
                        deciding on a listing price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FiBarChart2 size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Smart seller feature
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      Estimate before you list
                    </h3>
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-500">
                  Instead of relying only on guesswork, sellers can provide
                  details about their property and use the EstateLanka machine
                  learning model to understand its estimated market value.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <FiHome className="text-blue-600" size={19} />

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      Property features
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Area, bedrooms, bathrooms and other property
                      characteristics.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <FiMapPin className="text-blue-600" size={19} />

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      Location data
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Sri Lankan district information is considered by the
                      model.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <FiTrendingUp className="text-blue-600" size={19} />

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      ML-based estimate
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A trained machine learning model provides the estimated
                      property value.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <FiCheckCircle className="text-blue-600" size={19} />

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      Listing reference
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Use the estimate as a reference when preparing your
                      listing.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <FiCheckCircle
                    size={15}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-xs leading-5 text-slate-600">
                    The estimated value is intended as a reference and may
                    differ from the actual market value depending on property
                    condition, exact location and other factors.
                  </p>
                </div>

                <div className="mt-7">
                  <Link
                    to="/register"
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-lg
                      bg-blue-600
                      px-5 py-3
                      text-sm font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                    "
                  >
                    Start as a Seller
                    <FiArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROPERTY TYPES
      ====================================================== */}

      <section className="border-y border-slate-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-600">
              Explore by property type
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find the kind of place you are looking for
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Whether you're looking for a family home or a modern apartment,
              start your search with the property type that suits you.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* HOUSES */}

            <Link
              to="/properties?propertyType=house"
              className="group relative min-h-[300px] overflow-hidden rounded-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                alt="House"
                className="
                  absolute inset-0 h-full w-full
                  object-cover
                  transition duration-500
                  group-hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-slate-950/45 transition group-hover:bg-slate-950/55" />

              <div className="absolute bottom-0 left-0 p-7 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <FiHome size={21} />
                </div>

                <h3 className="mt-4 text-2xl font-bold">Houses</h3>

                <p className="mt-1 text-sm text-slate-200">
                  Family homes, modern houses and more
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Explore houses
                  <FiArrowRight size={15} />
                </span>
              </div>
            </Link>

            {/* APARTMENTS */}

            <Link
              to="/properties?propertyType=apartment"
              className="group relative min-h-[300px] overflow-hidden rounded-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
                alt="Apartment"
                className="
                  absolute inset-0 h-full w-full
                  object-cover
                  transition duration-500
                  group-hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-slate-950/45 transition group-hover:bg-slate-950/55" />

              <div className="absolute bottom-0 left-0 p-7 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <FiHome size={21} />
                </div>

                <h3 className="mt-4 text-2xl font-bold">Apartments</h3>

                <p className="mt-1 text-sm text-slate-200">
                  City apartments and modern living spaces
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Explore apartments
                  <FiArrowRight size={15} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          POPULAR LOCATIONS
      ====================================================== */}

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Popular locations
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Explore Sri Lanka by location
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Browse properties in some of the most searched areas across the
                island.
              </p>
            </div>

            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Explore all locations
              <FiArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularLocations.map((location) => (
              <Link
                key={location.name}
                to={`/properties?district=${encodeURIComponent(location.name)}`}
                className="group relative h-72 overflow-hidden rounded-xl"
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="
                    absolute inset-0 h-full w-full
                    object-cover
                    transition duration-500
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-200">
                    <FiMapPin size={13} />
                    Sri Lanka
                  </div>

                  <h3 className="mt-1 text-xl font-bold text-white">
                    {location.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-200">
                    {location.subtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Simple from start to finish
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Finding a property doesn't have to be complicated
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              EstateLanka keeps the process straightforward for both buyers and
              sellers.
            </p>
          </div>

          <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="absolute left-1/2 top-12 hidden h-px w-[55%] -translate-x-1/2 bg-slate-200 md:block" />

            {[
              {
                number: "01",
                icon: <FiSearch size={20} />,
                title: "Search",
                text: "Choose a location, property type and other filters to find listings that match your needs.",
              },
              {
                number: "02",
                icon: <FiHome size={20} />,
                title: "Explore",
                text: "Compare property details, photos, locations and prices before making a decision.",
              },
              {
                number: "03",
                icon: <FiPhone size={20} />,
                title: "Connect",
                text: "Send an inquiry and communicate directly with the seller about the property.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative z-10 text-center transition duration-500 hover:-translate-y-1"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 border-slate-50 bg-blue-600 text-white shadow-sm">
                  {step.icon}
                </div>

                <span className="mt-5 block text-xs font-bold tracking-widest text-blue-600">
                  STEP {step.number}
                </span>

                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY ESTATELANKA
      ====================================================== */}

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Why EstateLanka
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A simpler way to move closer to your next home
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Property searching can be time-consuming. EstateLanka brings
              listings, useful property information and buyer-seller
              communication together in one place.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FiCheckCircle size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Clear property information
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    See essential details such as bedrooms, bathrooms, area,
                    location and listing price before contacting a seller.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FiUsers size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Direct communication
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Buyers can send inquiries directly through the platform and
                    receive replies from sellers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FiKey size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Built for the local market
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Search by Sri Lankan district and find properties for both
                    sale and rent.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"
              alt="Modern home interior"
              className="h-[480px] w-full rounded-2xl object-cover"
            />

            <div className="absolute -bottom-6 left-5 max-w-xs rounded-xl bg-white p-5 shadow-xl sm:left-8">
              <div className="flex items-center gap-1 text-amber-500">
                <FiStar size={15} fill="currentColor" />
                <FiStar size={15} fill="currentColor" />
                <FiStar size={15} fill="currentColor" />
                <FiStar size={15} fill="currentColor" />
                <FiStar size={15} fill="currentColor" />
              </div>

              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                "The simple search experience is exactly what I needed."
              </p>

              <p className="mt-2 text-xs text-slate-400">— EstateLanka user</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIALS
      ====================================================== */}

      <section className="bg-slate-900 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-400">
              From our community
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              What people are saying
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
              A good property platform should make the search easier for
              everyone involved.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-950
                  p-6
                  transition duration-300
                  hover:-translate-y-1
                  hover:border-slate-700
                "
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} size={14} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300">
                  "{testimonial.text}"
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {testimonial.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {testimonial.role} · {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SELLER CTA
      ====================================================== */}

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-blue-700 px-6 py-12 sm:px-10 lg:px-14">
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-200">
                  Selling a property?
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Put your property in front of the right people.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Create your EstateLanka account and start listing your house
                  or apartment for potential buyers across Sri Lanka.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-lg
                    bg-white
                    px-6 py-3
                    text-sm font-semibold
                    text-blue-700
                    transition
                    hover:bg-blue-50
                  "
                >
                  Create Account
                  <FiArrowRight size={15} />
                </Link>

                <Link
                  to="/properties"
                  className="
                    inline-flex items-center justify-center
                    rounded-lg
                    border border-blue-400
                    px-6 py-3
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-blue-600
                  "
                >
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   PROPERTY CARD
============================================================ */

function PropertyCard({ property, formatPrice }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/properties/${property._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
        <img
          src={
            property.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
          }
          alt={property.title}
          className="
            h-full w-full
            object-cover
            transition duration-500
            group-hover:scale-105
          "
        />

        <span
          className={`
            absolute left-4 top-4
            rounded-md
            px-2.5 py-1.5
            text-[11px] font-bold uppercase tracking-wide
            text-white
            ${property.listingType === "sale"
              ? "bg-blue-600"
              : "bg-slate-900/80"
            }
          `}
        >
          For {property.listingType}
        </span>

        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm">
          <FiHeart size={14} />
        </div>
      </Link>

      <div className="p-5">
        <p className="text-lg font-bold text-slate-900">
          {formatPrice(property.price, property.listingType)}
        </p>

        <Link
          to={`/properties/${property._id}`}
          className="
            mt-2 block
            line-clamp-1
            text-base font-semibold
            text-slate-800
            transition
            group-hover:text-blue-600
          "
        >
          {property.title}
        </Link>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <FiMapPin className="text-blue-500" size={13} />
          {property.location?.city}, {property.location?.district}
        </p>

        <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>{property.bedrooms} Beds</span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>{property.bathrooms} Baths</span>

          <span className="h-1 w-1 rounded-full bg-slate-300" />

          <span>{property.area} Sq Ft</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs capitalize text-slate-400">
            {property.propertyType}
          </span>

          <Link
            to={`/properties/${property._id}`}
            className="
              inline-flex items-center gap-1.5
              text-xs font-semibold
              text-blue-600
              transition
              hover:text-blue-700
            "
          >
            View property
            <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default Home;
