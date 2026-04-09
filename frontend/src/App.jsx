import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

const getIcon = (wait) => {
  if (wait <= 15) return greenIcon;
  if (wait <= 35) return yellowIcon;
  return redIcon;
};

const STATIONS = [
  // Hyderabad
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
  // Telangana
  { id: 11, name: "EV Point - Warangal",               lat: 17.9784, lng: 79.5941, load: 50, nearby: 2 },
  { id: 12, name: "Charge Zone - Karimnagar",          lat: 18.4386, lng: 79.1288, load: 40, nearby: 1 },
  { id: 13, name: "Tata Power - Nizamabad",            lat: 18.6725, lng: 78.0941, load: 65, nearby: 2 },
  { id: 14, name: "EV Station - Khammam",              lat: 17.2473, lng: 80.1514, load: 30, nearby: 1 },
  { id: 15, name: "Charge Grid - Nalgonda",            lat: 17.0575, lng: 79.2671, load: 55, nearby: 2 },
  { id: 16, name: "Jio-BP - Mahbubnagar",              lat: 16.7375, lng: 77.9831, load: 45, nearby: 1 },
  // Vijayawada
  { id: 17, name: "Tata Power - Vijayawada Center",   lat: 16.5062, lng: 80.6480, load: 55, nearby: 3 },
  { id: 26, name: "Charge Zone - Benz Circle",         lat: 16.5193, lng: 80.6305, load: 60, nearby: 2 },
  { id: 27, name: "EV Point - Governorpet",            lat: 16.5085, lng: 80.6398, load: 40, nearby: 3 },
  { id: 28, name: "Jio-BP - Patamata",                 lat: 16.4931, lng: 80.6671, load: 70, nearby: 2 },
  { id: 29, name: "EV Station - Moghalrajpuram",       lat: 16.5341, lng: 80.6423, load: 35, nearby: 4 },
  { id: 30, name: "Charge Grid - Vijayawada Junction", lat: 16.5167, lng: 80.6167, load: 80, nearby: 1 },
  // Andhra Pradesh
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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function App() {
  const [hour, setHour] = useState(9);
  const [day, setDay] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  const handleGetLocation = () => {
    setLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("📍 Location detected!");
      },
      () => {
        setLocationStatus("❌ Location access denied. Using Hyderabad as default.");
        setUserLocation({ lat: 17.385, lng: 78.4867 });
      }
    );
  };

  const handlePredict = async () => {
    const loc = userLocation || { lat: 17.385, lng: 78.4867 };
    setLoading(true);
    setSearched(true);
    try {
      const stationsWithDistance = STATIONS.map(s => ({
        ...s,
        distance: parseFloat(getDistanceKm(loc.lat, loc.lng, s.lat, s.lng).toFixed(1)),
      }));

      const res = await axios.post("http://localhost:5000/api/predict", {
        hour,
        day_of_week: day,
        stations: stationsWithDistance,
      });
      setResults(res.data.stations);
    } catch (err) {
      alert("Backend not running! Start Flask first.");
    }
    setLoading(false);
  };

  const getColor = (wait) => {
    if (wait <= 15) return "bg-green-100 border-green-400 text-green-800";
    if (wait <= 35) return "bg-yellow-100 border-yellow-400 text-yellow-800";
    return "bg-red-100 border-red-400 text-red-800";
  };

  const getLabel = (wait) => {
    if (wait <= 15) return "✅ Best Choice";
    if (wait <= 35) return "⚠️ Moderate Wait";
    return "❌ Avoid Now";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">⚡ EV Charging Finder</h1>
          <p className="text-gray-500 mt-1">Predicts the best charging station for you</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">

          {/* Location */}
          <div className="mb-4">
            <button
              onClick={handleGetLocation}
              className="w-full border border-green-500 text-green-700 font-medium py-2 rounded-xl hover:bg-green-50 transition text-sm"
            >
              📍 Use My Current Location
            </button>
            {locationStatus && (
              <p className="text-xs text-gray-500 mt-1 text-center">{locationStatus}</p>
            )}
          </div>

          {/* Hour slider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hour of Day: <span className="text-green-600 font-bold">{hour}:00</span>
            </label>
            <input
              type="range" min="0" max="23" value={hour}
              onChange={e => setHour(Number(e.target.value))}
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
            </div>
          </div>

          {/* Day dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
            <select
              value={day}
              onChange={e => setDay(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>

          <button
            onClick={handlePredict}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Predicting..." : "🔍 Find Best Station"}
          </button>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Stations ranked by predicted wait time
            </h2>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">⏱ Wait Time Comparison (top 8)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.slice(0, 8)} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11 }} unit=" min" />
                  <Tooltip formatter={(val) => [`${val} min`, "Wait Time"]} />
                  <Bar dataKey="wait_time_minutes" radius={[6, 6, 0, 0]}>
                    {results.slice(0, 8).map((s) => (
                      <Cell
                        key={s.id}
                        fill={
                          s.wait_time_minutes <= 15
                            ? "#22c55e"
                            : s.wait_time_minutes <= 35
                            ? "#eab308"
                            : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">🗺 Station Map</h3>
              <MapContainer
                center={[17.385, 78.4867]}
                zoom={6}
                style={{ height: "380px", borderRadius: "12px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {results.map((s) => {
                  const station = STATIONS.find(st => st.id === s.id);
                  if (!station) return null;
                  return (
                    <Marker
                      key={s.id}
                      position={[station.lat, station.lng]}
                      icon={getIcon(s.wait_time_minutes)}
                    >
                      <Popup>
                        <strong>{s.name}</strong><br />
                        ⏱ Wait: {s.wait_time_minutes} min<br />
                        🔋 Load: {s.load}%<br />
                        📍 {s.distance} km away
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">🟢 Best &nbsp; 🟡 Moderate &nbsp; 🔴 Avoid</p>
            </div>

            {/* Station Cards */}
            {results.map((s, i) => (
              <div
                key={s.id}
                className={`border-l-4 rounded-xl p-4 mb-3 shadow-sm ${getColor(s.wait_time_minutes)}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-base">#{i + 1} {s.name}</p>
                    <p className="text-sm mt-1">
                      📍 {s.distance} km away &nbsp;|&nbsp; 🔋 Load: {s.load}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{s.wait_time_minutes} min</p>
                    <p className="text-xs mt-1">{getLabel(s.wait_time_minutes)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">📘 How This System Works</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">🔍 Problem</h3>
            <p className="text-sm text-gray-500">
              Existing EV apps suggest the <em>nearest</em> station — not the <em>best</em> one.
              A nearby station with 90% load and 45 min wait is worse than one 10 km away with 5 min wait.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">🤖 ML Model Used</h3>
            <p className="text-sm text-gray-500">
              This system uses a <strong>Random Forest</strong> algorithm — an ensemble of decision trees
              that votes on the best prediction. Two models are trained:
            </p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
              <li><strong>Classifier</strong> — predicts if a station is available (yes/no)</li>
              <li><strong>Regressor</strong> — predicts exact wait time in minutes</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">📊 Input Features</h3>
            <ul className="text-sm text-gray-500 mt-1 space-y-1 list-disc list-inside">
              <li>Hour of day (0–23)</li>
              <li>Day of week (Mon–Sun)</li>
              <li>Current station load (%)</li>
              <li>Number of nearby stations</li>
              <li>Distance from user (km)</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">⚙️ How Prediction Works</h3>
            <p className="text-sm text-gray-500">
              When you click <strong>Find Best Station</strong>, your location and selected time
              are sent to a Flask backend. For each station, the ML model predicts the wait time.
              Stations are then sorted from lowest to highest wait time and displayed with color codes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-1">🎯 Model Accuracy</h3>
            <div className="flex gap-4 mt-2">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center flex-1">
                <p className="text-2xl font-bold text-green-700">100%</p>
                <p className="text-xs text-gray-500 mt-1">Availability Accuracy</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-center flex-1">
                <p className="text-2xl font-bold text-blue-700">~2.8 min</p>
                <p className="text-xs text-gray-500 mt-1">Wait Time Error (MAE)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}