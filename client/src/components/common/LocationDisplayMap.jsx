import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiMapPin, FiExternalLink, FiNavigation } from "react-icons/fi";

// Fix default Leaflet marker icon issue in Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const customIcon = L.divIcon({
  className: "custom-map-marker",
  html: `<div style="
    background: #0284c7;
    width: 38px;
    height: 38px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
    border: 3px solid #ffffff;
  ">
    <div style="
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

const LocationDisplayMap = ({ coordinates, address, city, district, title }) => {
  const lat = coordinates?.lat ? Number(coordinates.lat) : null;
  const lng = coordinates?.lng ? Number(coordinates.lng) : null;

  const hasValidCoordinates =
    lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const googleMapsUrl = hasValidCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${address || ""}, ${city || ""}, ${district || ""}, Sri Lanka`
      )}`;

  const fullLocationString = [address, city, district]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
      {/* Location Details Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-xl mt-0.5 shrink-0">
            <FiMapPin className="text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Property Location
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fullLocationString || "Location specified"}
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all hover:shadow-md"
        >
          <FiNavigation />
          <span>Open in Google Maps</span>
          <FiExternalLink className="text-sky-200" />
        </a>
      </div>

      {/* Map View */}
      {hasValidCoordinates ? (
        <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md z-0">
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={[lat, lng]} />
            <Marker position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="p-1 max-w-xs">
                  <h5 className="font-bold text-slate-900 text-sm mb-1">{title}</h5>
                  <p className="text-xs text-slate-600">{fullLocationString}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Quick link badge overlay */}
          <div className="absolute bottom-4 right-4 z-[400]">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5 hover:scale-105 transition-transform"
            >
              <span>View Satellite & Directions on Google Maps</span>
              <FiExternalLink />
            </a>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FiMapPin className="text-3xl text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            Exact map pin not provided by seller.
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300 rounded-lg hover:bg-sky-100 transition-colors border border-sky-200 dark:border-sky-800"
          >
            Search Location on Google Maps
            <FiExternalLink />
          </a>
        </div>
      )}
    </div>
  );
};

export default LocationDisplayMap;
