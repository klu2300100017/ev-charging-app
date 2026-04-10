import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const getIcon = (wait) => {
  if (wait <= 15) return greenIcon;
  if (wait <= 35) return yellowIcon;
  return redIcon;
};

const STATIONS = [
  { id: 1,  name: "EV Point - Hitech City",            lat: 17.4474, lng: 78.3762, load: 45, nearby: 3 },
  { id: 2,  name: "Charge Zone - Gachibowli",          lat: 17.4401, lng: 78.3489, load: 80, nearby: 2 },
  { id: 3,  name: "Tata Power - Jubilee Hills",        lat: 17.4324, lng: 78.4071, load: 30, nearby: 5 },
  { id: 4,  name: "KSEB - Madhapur",                   lat: 17.4486, lng: 78.3908, load: 65, nearby: 4 },
  { id: 5,  name: "Jio-BP - Banjara Hills",            lat: 17.4156, lng: 78.4472, load: 90, nearby: 1 },
  { id: 6,  name: "Charge Grid - Secunderabad",        lat: 17.4399, lng: 78.4983, load: 40, nearby: 3 },
  { id: 7,  name: "EV Station - Kukatpally",           lat: 17.4849, lng: 78.3995, load: 55, nearby: 2 },
  { id: 8,  name: "Tata Power - LB Nagar",             lat: 17.3483, lng: 78.5516, load: 70, nearby: 2 },
  { id: 9,  name: "Charge Zone - Uppal",               lat: 17.4052, lng: 78.5590, load: 35, nearby: 4 },
  { id: 10, name: "Jio-BP - Mehdipatnam",              lat: 17.3929, lng: 78.4335, load: 60, nearby: 3 },
  { id: 11, name: "EV Point - Warangal",               lat: 17.9784, lng: 79.5941, load: 50, nearby: 2 },
  { id: 12, name: "Charge Zone - Karimnagar",          lat: 18.4386, lng: 79.1288, load: 40, nearby: 1 },
  { id: 13, name: "Tata Power - Nizamabad",            lat: 18.6725, lng: 78.0941, load: 65, nearby: 2 },
  { id: 14, name: "EV Station - Khammam",              lat: 17.2473, lng: 80.1514, load: 30, nearby: 1 },
  { id: 15, name: "Charge Grid - Nalgonda",            lat: 17.0575, lng: 79.2671, load: 55, nearby: 2 },
  { id: 16, name: "Jio-BP - Mahbubnagar",              lat: 16.7375, lng: 77.9831, load: 45, nearby: 1 },
  { id: 17, name: "Tata Power - Vijayawada Center",    lat: 16.5062, lng: 80.6480, load: 55, nearby: 3 },
  { id: 26, name: "Charge Zone - Benz Circle",         lat: 16.5193, lng: 80.6305, load: 60, nearby: 2 },
  { id: 27, name: "EV Point - Governorpet",            lat: 16.5085, lng: 80.6398, load: 40, nearby: 3 },
  { id: 28, name: "Jio-BP - Patamata",                 lat: 16.4931, lng: 80.6671, load: 70, nearby: 2 },
  { id: 29, name: "EV Station - Moghalrajpuram",       lat: 16.5341, lng: 80.6423, load: 35, nearby: 4 },
  { id: 30, name: "Charge Grid - Vijayawada Junction", lat: 16.5167, lng: 80.6167, load: 80, nearby: 1 },
  { id: 18, name: "EV Point - Visakhapatnam",          lat: 17.6868, lng: 83.2185, load: 70, nearby: 4 },
  { id: 19, name: "Charge Zone - Guntur",              lat: 16.3067, lng: 80.4365, load: 40, nearby: 2 },
  { id: 20, name: "Jio-BP - Tirupati",                 lat: 13.6288, lng: 79.4192, load: 80, nearby: 2 },
  { id: 21, name: "EV Station - Nellore",              lat: 14.4426, lng: 79.9865, load: 35, nearby: 1 },
  { id: 22, name: "Charge Grid - Kurnool",             lat: 15.8281, lng: 78.0373, load: 60, nearby: 2 },
  { id: 23, name: "Tata Power - Rajahmundry",          lat: 17.0005, lng: 81.8040, load: 45, nearby: 2 },
  { id: 24, name: "EV Point - Kadapa",                 lat: 14.4673, lng: 78.8242, load: 50, nearby: 1 },
  { id: 25, name: "Charge Zone - Anantapur",           lat: 14.6819, lng: 77.6006, load: 30, nearby: 1 },
];

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapFlyTo({ center }) {
  const map = useMap();
  if (center) map.flyTo(center, 13, { duration: 1.5 });
  return null;
}

function StationPopup({ s, onDirections }) {
  return (
    <Popup>
      <div style={{ minWidth: "160px" }}>
        <strong>{s.name}</strong>
        <div>{"Wait: " + s.wait_time_minutes + " min"}</div>
        <div>{"Load: " + s.load + "%"}</div>
        <div>{"Distance: " + s.distance + " km"}</div>
        <button
          onClick={() => onDirections(s)}
          style={{ marginTop: "6px", color: "white", background: "green", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", width: "100%" }}
        >
          Get Directions
        </button>
      </div>
    </Popup>
  );
}

function getNowDatetimeLocal() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

// ---------------------------------------------------------------------------
// Booking Modal
// ---------------------------------------------------------------------------
function BookingModal({ station, prefilledTime, onClose, onSuccess }) {
  const [form, setForm] = useState({
    user_name: "",
    phone: "",
    vehicle_no: "",
    slot_time: prefilledTime || getNowDatetimeLocal(),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.user_name || !form.phone || !form.vehicle_no || !form.slot_time) {
      setError("Please fill all fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const slotDate = new Date(form.slot_time);
    const slotHour = slotDate.getHours();
    const slotDay = slotDate.getDay() === 0 ? 6 : slotDate.getDay() - 1;
    const stationData = STATIONS.find(s => s.id === station.id);

    try {
      await axios.post("https://ev-charging-backend-q5ua.onrender.com", {
        station_id: station.id,
        station_name: station.name,
        user_name: form.user_name,
        phone: form.phone,
        vehicle_no: form.vehicle_no,
        slot_time: slotDate.toLocaleString("en-IN"),
        hour_of_day: slotHour,
        day_of_week: slotDay,
        load_at_booking: stationData ? stationData.load : 70,
        nearby_stations: stationData ? stationData.nearby : 2,
        distance_km: station.distance || 1.0,
      });
      onSuccess();
    } catch {
      setError("Booking failed. Make sure backend is running.");
    }
    setSubmitting(false);
  };

  const slotDate = new Date(form.slot_time);
  const isNow = Math.abs(slotDate - new Date()) < 5 * 60 * 1000; // within 5 min = now

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "420px" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontWeight: "bold", fontSize: "18px", color: "#15803d", margin: 0 }}>Book a Slot</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#6b7280" }}>x</button>
        </div>

        <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
          <p style={{ fontWeight: "600", fontSize: "14px", color: "#166534", margin: 0 }}>{station.name}</p>
          <p style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px", margin: "4px 0 0 0" }}>
            {station.wait_time_minutes} min predicted wait | {station.distance} km away
          </p>
        </div>

        {[
          { label: "Full Name", name: "user_name", placeholder: "Enter your name" },
          { label: "Phone Number", name: "phone", placeholder: "Enter your phone number" },
          { label: "Vehicle Number", name: "vehicle_no", placeholder: "e.g. TS09EX1234" },
        ].map(field => (
          <div key={field.name} style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>{field.label}</label>
            <input
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>
        ))}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#374151", marginBottom: "4px" }}>
            Slot Date and Time
          </label>
          <input
            type="datetime-local"
            name="slot_time"
            value={form.slot_time}
            min={getNowDatetimeLocal()}
            onChange={handleChange}
            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", boxSizing: "border-box" }}
          />
          <p style={{ fontSize: "11px", color: isNow ? "#16a34a" : "#6b7280", marginTop: "4px" }}>
            {isNow
              ? "Booking for right now"
              : "Booking for: " + slotDate.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: "100%", background: submitting ? "#86efac" : "#16a34a", color: "white", fontWeight: "bold", padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "15px" }}
        >
          {submitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

function SuccessToast({ message, onClose }) {
  return (
    <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#16a34a", color: "white", padding: "14px 28px", borderRadius: "12px", fontWeight: "600", fontSize: "15px", zIndex: 99999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
      {message}
      <button onClick={onClose} style={{ marginLeft: "16px", background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}>x</button>
    </div>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function App() {
  const now = new Date();
  const [bookForLater, setBookForLater] = useState(false);
  const [laterDatetime, setLaterDatetime] = useState(getNowDatetimeLocal());
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [bestStation, setBestStation] = useState(null);
  const [radius, setRadius] = useState(30);
  const [usedTime, setUsedTime] = useState(null);
  const [bookingStation, setBookingStation] = useState(null);
  const [toast, setToast] = useState("");

  const getHourAndDay = () => {
    if (bookForLater && laterDatetime) {
      const d = new Date(laterDatetime);
      return { hour: d.getHours(), day: d.getDay() === 0 ? 6 : d.getDay() - 1 };
    }
    return { hour: now.getHours(), day: now.getDay() === 0 ? 6 : now.getDay() - 1 };
  };

  // The prefilled time for booking modal:
  // if bookForLater is on → use that selected time
  // if bookForLater is off → use real current time
  const getPrefilledTime = () => {
    if (bookForLater && laterDatetime) return laterDatetime;
    return getNowDatetimeLocal();
  };

  const handleGetLocation = () => {
    setLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("Location detected! Now click Find Best Station.");
      },
      () => {
        setLocationStatus("Location access denied. Using Hyderabad as default.");
        setUserLocation({ lat: 17.385, lng: 78.4867 });
      }
    );
  };

  const handlePredict = async () => {
    const loc = userLocation || { lat: 17.385, lng: 78.4867 };
    const { hour, day } = getHourAndDay();
    setLoading(true);
    setSearched(true);

    if (bookForLater && laterDatetime) {
      const d = new Date(laterDatetime);
      setUsedTime(d.toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: true }));
    } else {
      setUsedTime("Now (" + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + ")");
    }

    const nearbyStations = STATIONS
      .map(s => ({ ...s, distance: parseFloat(getDistanceKm(loc.lat, loc.lng, s.lat, s.lng).toFixed(1)) }))
      .filter(s => s.distance <= radius);

    if (nearbyStations.length === 0) {
      setResults([]);
      setBestStation(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/predict", { hour, day_of_week: day, stations: nearbyStations });
      setResults(res.data.stations);
      setBestStation(res.data.stations[0]);
    } catch {
      alert("Backend not running! Start Flask first.");
    }
    setLoading(false);
  };

  const openGoogleMaps = (station) => {
    const found = STATIONS.find(s => s.id === station.id);
    if (!found) return;
    window.open("https://www.google.com/maps/dir/?api=1&destination=" + found.lat + "," + found.lng + "&travelmode=driving", "_blank");
  };

  const getColor = (wait) => {
    if (wait <= 15) return "bg-green-100 border-green-400 text-green-800";
    if (wait <= 35) return "bg-yellow-100 border-yellow-400 text-yellow-800";
    return "bg-red-100 border-red-400 text-red-800";
  };

  const getLabel = (wait) => {
    if (wait <= 15) return "Best Choice";
    if (wait <= 35) return "Moderate Wait";
    return "Avoid Now";
  };

  const currentTimeDisplay = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + ", " + DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">EV Charging Finder</h1>
          <p className="text-gray-500 text-sm mt-1">Finds the best charging station near you using AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="mb-4">
            <button onClick={handleGetLocation} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition text-sm">
              Detect My Location
            </button>
            {locationStatus && <p className="text-xs text-gray-500 mt-2 text-center">{locationStatus}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius: <span className="text-green-600 font-bold">{radius} km</span>
            </label>
            <input type="range" min="5" max="100" step="5" value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-green-600" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 km</span><span>50 km</span><span>100 km</span>
            </div>
          </div>

          <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: bookForLater ? "12px" : "0" }}>
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                {!bookForLater && <p className="text-xs text-green-600 mt-0.5">Using current time: {currentTimeDisplay}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="text-xs text-gray-500">Book for Later</span>
                <button
                  onClick={() => setBookForLater(!bookForLater)}
                  className={"relative w-11 h-6 rounded-full transition-colors " + (bookForLater ? "bg-green-500" : "bg-gray-300")}
                >
                  <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (bookForLater ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
            {bookForLater && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Select date and time:</label>
                <input
                  type="datetime-local"
                  value={laterDatetime}
                  min={getNowDatetimeLocal()}
                  onChange={e => setLaterDatetime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                {laterDatetime && (
                  <p className="text-xs text-green-600 mt-1">
                    Predicting for: {new Date(laterDatetime).toLocaleString("en-IN", { weekday: "long", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </p>
                )}
              </div>
            )}
          </div>

          <button onClick={handlePredict} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition">
            {loading ? "Finding best station..." : "Find Best Station Near Me"}
          </button>
        </div>

        {searched && !loading && results.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-center mb-6">
            <p className="text-yellow-700 font-semibold">No stations found within {radius} km</p>
            <p className="text-yellow-600 text-sm mt-1">Try increasing the search radius</p>
          </div>
        )}

        {bestStation && (
          <div className="bg-green-600 text-white rounded-2xl p-5 mb-6 shadow-lg">
            <p className="text-xs uppercase tracking-widest mb-1 opacity-70">Best Station For You</p>
            {usedTime && <p className="text-xs opacity-70 mb-2">Predicted for: {usedTime}</p>}
            <p className="text-xl font-bold">{bestStation.name}</p>
            <p className="text-sm mt-1 opacity-90">{bestStation.wait_time_minutes} min wait | {bestStation.distance} km away | Load: {bestStation.load}%</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
              <button onClick={() => openGoogleMaps(bestStation)} style={{ flex: 1, background: "white", color: "#15803d", fontWeight: "700", border: "none", borderRadius: "12px", padding: "8px", cursor: "pointer" }}>
                Get Directions
              </button>
              <button onClick={() => setBookingStation(bestStation)} style={{ flex: 1, background: "#fbbf24", color: "#1c1917", fontWeight: "700", border: "none", borderRadius: "12px", padding: "8px", cursor: "pointer" }}>
                Book This Slot
              </button>
            </div>
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Nearby Stations Map</h3>
            <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [17.385, 78.4867]} zoom={12} style={{ height: "380px", borderRadius: "12px" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              {userLocation && (
                <>
                  <MapFlyTo center={[userLocation.lat, userLocation.lng]} />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
                    <Popup><div><strong>You are here</strong></div></Popup>
                  </Marker>
                </>
              )}
              {results.map((s) => {
                const station = STATIONS.find(st => st.id === s.id);
                if (!station) return null;
                return (
                  <Marker key={s.id} position={[station.lat, station.lng]} icon={getIcon(s.wait_time_minutes)}>
                    <StationPopup s={s} onDirections={openGoogleMaps} />
                  </Marker>
                );
              })}
            </MapContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">Blue = You | Green = Best | Yellow = Moderate | Red = Avoid</p>
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {results.length} stations found within {radius} km
              {usedTime && <span className="text-sm font-normal text-gray-400 ml-2">({usedTime})</span>}
            </h2>
            {results.map((s, i) => (
              <div key={s.id} className={"border-l-4 rounded-xl p-4 mb-3 shadow-sm " + getColor(s.wait_time_minutes)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p className="font-semibold text-base">{"#" + (i + 1) + " " + s.name}</p>
                    <p className="text-sm mt-1">{s.distance} km away | Load: {s.load}%</p>
                    <p className="text-xs mt-1">{getLabel(s.wait_time_minutes)}</p>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: "12px" }}>
                    <p className="text-2xl font-bold">{s.wait_time_minutes} min</p>
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => openGoogleMaps(s)} className="text-xs bg-white border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">
                        Directions
                      </button>
                      <button onClick={() => setBookingStation(s)} style={{ fontSize: "12px", background: "#fbbf24", color: "#1c1917", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontWeight: "600" }}>
                        Book Slot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">How This System Works</h2>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Problem</h3>
            <p className="text-sm text-gray-500">Existing EV apps suggest the nearest station, not the best one. A nearby station with 90% load and 45 min wait is worse than one 10 km away with 5 min wait.</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">ML Model Used</h3>
            <p className="text-sm text-gray-500">This system uses a Random Forest algorithm. Two models are trained:</p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
              <li>Classifier predicts if a station is available</li>
              <li>Regressor predicts exact wait time in minutes</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Self-Improving Model</h3>
            <p className="text-sm text-gray-500">Every booking saves the real station load, day, and hour. The owner can retrain the model anytime using this real data, making predictions smarter over time per station, per day, and per time slot.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">Model Accuracy</h3>
            <div className="flex gap-4 mt-2">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center flex-1">
                <p className="text-2xl font-bold text-green-700">100%</p>
                <p className="text-xs text-gray-500 mt-1">Availability Accuracy</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center flex-1">
                <p className="text-2xl font-bold text-blue-700">2.8 min</p>
                <p className="text-xs text-gray-500 mt-1">Wait Time Error (MAE)</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {bookingStation && (
        <BookingModal
          station={bookingStation}
          prefilledTime={getPrefilledTime()}
          onClose={() => setBookingStation(null)}
          onSuccess={() => {
            setBookingStation(null);
            setToast("Slot booked successfully!");
            setTimeout(() => setToast(""), 3500);
          }}
        />
      )}

      {toast && <SuccessToast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}