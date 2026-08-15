import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiMapPin, FiNavigation, FiTrash2, FiCompass } from "react-icons/fi";

// Fix default Leaflet marker icon issue in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom styled pin icon
const customIcon = L.divIcon({
  className: "custom-map-marker",
  html: `<div style="
    background: #0284c7;
    width: 34px;
    height: 34px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4);
    border: 3px solid #ffffff;
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Component to recenter map when position changes programmatically
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

// Component to handle map clicks
function MapClickHandler({ onSelectPosition }) {
  useMapEvents({
    click(e) {
      onSelectPosition({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}

const DEFAULT_CENTER = [6.9271, 79.8612]; // Colombo, Sri Lanka

const LocationPickerMap = ({ value, onChange }) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const currentLat = value?.lat !== "" && value?.lat !== null && value?.lat !== undefined ? Number(value.lat) : null;
  const currentLng = value?.lng !== "" && value?.lng !== null && value?.lng !== undefined ? Number(value.lng) : null;

  const hasCoordinates =
    currentLat !== null &&
    currentLng !== null &&
    !isNaN(currentLat) &&
    !isNaN(currentLng);

  const centerPosition = hasCoordinates
    ? [currentLat, currentLng]
    : DEFAULT_CENTER;

  const handleSelectPosition = (newCoords) => {
    setGeoError("");
    onChange(newCoords);
  };

  const handleClear = () => {
    onChange({ lat: "", lng: "" });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        handleSelectPosition({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      (error) => {
        setGeoLoading(false);
        setGeoError("Unable to retrieve location. Please select on the map.");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          Property Location on Map <span className="text-slate-400 font-normal">(Click map to place pin)</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200 dark:border-sky-800 disabled:opacity-50 cursor-pointer"
          >
            <FiNavigation className={geoLoading ? "animate-spin" : ""} />
            {geoLoading ? "Locating..." : "Use Current Location"}
          </button>

          {hasCoordinates && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 dark:border-rose-800 cursor-pointer"
            >
              <FiTrash2 />
              Clear Pin
            </button>
          )}
        </div>
      </div>

      {geoError && (
        <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
          {geoError}
        </div>
      )}

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm z-0">
        <MapContainer
          center={centerPosition}
          zoom={hasCoordinates ? 14 : 11}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={centerPosition} zoom={hasCoordinates ? 14 : undefined} />
          <MapClickHandler onSelectPosition={handleSelectPosition} />

          {hasCoordinates && (
            <Marker position={[currentLat, currentLng]} icon={customIcon} />
          )}
        </MapContainer>

        {/* Top Hint Bar */}
        <div className="absolute top-3 left-3 right-3 pointer-events-none z-[400]">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FiCompass className="text-sky-600 dark:text-sky-400" />
              {hasCoordinates
                ? "Location Pinned! Click anywhere on map to reposition."
                : "Click on map to drop property marker"}
            </span>
          </div>
        </div>
      </div>

      {/* Lat & Lng Input Display */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 6.927079"
            value={value?.lat ?? ""}
            onChange={(e) =>
              onChange({ ...value, lat: e.target.value })
            }
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 79.861244"
            value={value?.lng ?? ""}
            onChange={(e) =>
              onChange({ ...value, lng: e.target.value })
            }
            className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
