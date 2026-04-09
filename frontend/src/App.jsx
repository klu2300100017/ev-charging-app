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

function StationPopup({ s, station, onDirections }) {
  return (
    <Popup>
      <div style={{ minWidth: "160px" }}>
        <strong>{s.name}</strong>
        <div>{"Wait: " + s.wait_time_minutes + " min"}</div>
        <div>{"Load: " + s.load + "%"}</div>
        <div>{"Distance: " + s.distance + " km"}</div>
        <button
          onClick={() => onDirections(s)}
          style={{
            marginTop: "6px",
            color: "white",
            background: "green",
            border: "none",
            borderRadius: "4px",
            padding: "4px 8px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Get Directions
        </button>
      </div>
    </Popup>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Helper: get minimum datetime string for input (now)
function getNowDatetimeLocal() {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

export default function App() {
  const now = new Date();

  // Auto time: always use current device time
  const [bookForLater, setBookForLater] = useState(false);
  const [laterDatetime, setLaterDatetime] = useState(getNowDatetimeLocal());

  // Compute actual hour and day to send to backend
  const getHourAndDay = () => {
    if (bookForLater && laterDatetime) {
      const d = new Date(laterDatetime);
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      return { hour: d.getHours(), day: dayIndex };
    }
    const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
    return { hour: now.getHours(), day: dayIndex };
  };

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [bestStation, setBestStation] = useState(null);
  const [radius, setRadius] = useState(30);
  const [usedTime, setUsedTime] = useState(null);

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

    // Store what time was used for display
    if (bookForLater && laterDatetime) {
      const d = new Date(laterDatetime);
      setUsedTime(d.toLocaleString("en-IN", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: true }));
    } else {
      const n = new Date();
      setUsedTime("Now (" + n.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + ")");
    }

    const nearbyStations = STATIONS
      .map(s => ({
        ...s,
        distance: parseFloat(getDistanceKm(loc.lat, loc.lng, s.lat, s.lng).toFixed(1)),
      }))
      .filter(s => s.distance <= radius);

    if (nearbyStations.length === 0) {
      setResults([]);
      setBestStation(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/predict", {
        hour,
        day_of_week: day,
        stations: nearbyStations,
      });
      const sorted = res.data.stations;
      setResults(sorted);
      setBestStation(sorted[0]);
    } catch (err) {
      alert("Backend not running! Start Flask first.");
    }
    setLoading(false);
  };

  const openGoogleMaps = (station) => {
    const found = STATIONS.find(s => s.id === station.id);
    if (!found) return;
    const url = "https://www.google.com/maps/dir/?api=1&destination=" + found.lat + "," + found.lng + "&travelmode=driving";
    window.open(url, "_blank");
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

  const currentTimeDisplay = now.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  }) + ", " + DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-700">EV Charging Finder</h1>
          <p className="text-gray-500 mt-1 text-sm">Finds the best charging station near you using AI</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">

          {/* Location */}
          <div className="mb-4">
            <button
              onClick={handleGetLocation}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition text-sm"
            >
              Detect My Location
            </button>
            {locationStatus && (
              <p className="text-xs text-gray-500 mt-2 text-center">{locationStatus}</p>
            )}
          </div>

          {/* Radius */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius: <span className="text-green-600 font-bold">{radius} km</span>
            </label>
            <input
              type="range" min="5" max="100" step="5" value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 km</span><span>50 km</span><span>100 km</span>
            </div>
          </div>

          {/* Time Mode Toggle */}
          <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">

            {/* Current time display */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Time</p>
                {!bookForLater && (
                  <p className="text-xs text-green-600 mt-0.5">Using current time: {currentTimeDisplay}</p>
                )}
              </div>
              {/* Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Book for Later</span>
                <button
                  onClick={() => setBookForLater(!bookForLater)}
                  className={
                    "relative w-11 h-6 rounded-full transition-colors " +
                    (bookForLater ? "bg-green-500" : "bg-gray-300")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " +
                      (bookForLater ? "translate-x-5" : "translate-x-0")
                    }
                  />
                </button>
              </div>
            </div>

            {/* Later datetime picker — shown only when toggle is ON */}
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
                    Predicting for: {new Date(laterDatetime).toLocaleString("en-IN", {
                      weekday: "long", hour: "2-digit", minute: "2-digit", hour12: true,
                    })}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handlePredict}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Finding best station..." : "Find Best Station Near Me"}
          </button>
        </div>

        {/* No stations found */}
        {searched && !loading && results.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-center mb-6">
            <p className="text-yellow-700 font-semibold">No stations found within {radius} km</p>
            <p className="text-yellow-600 text-sm mt-1">Try increasing the search radius</p>
          </div>
        )}

        {/* Best Station Banner */}
        {bestStation && (
          <div className="bg-green-600 text-white rounded-2xl p-5 mb-6 shadow-lg">
            <p className="text-xs uppercase tracking-widest mb-1 opacity-70">Best Station For You</p>
            {usedTime && (
              <p className="text-xs opacity-70 mb-2">Predicted for: {usedTime}</p>
            )}
            <p className="text-xl font-bold">{bestStation.name}</p>
            <p className="text-sm mt-1 opacity-90">
              {bestStation.wait_time_minutes} min wait | {bestStation.distance} km away | Load: {bestStation.load}%
            </p>
            <button
              onClick={() => openGoogleMaps(bestStation)}
              className="mt-4 w-full bg-white text-green-700 font-bold py-2 rounded-xl hover:bg-green-50 transition"
            >
              Get Directions on Google Maps
            </button>
          </div>
        )}

        {/* Map */}
        {searched && !loading && results.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Nearby Stations Map</h3>
            <MapContainer
              center={userLocation ? [userLocation.lat, userLocation.lng] : [17.385, 78.4867]}
              zoom={12}
              style={{ height: "380px", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {userLocation && (
                <>
                  <MapFlyTo center={[userLocation.lat, userLocation.lng]} />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
                    <Popup>
                      <div><strong>You are here</strong></div>
                    </Popup>
                  </Marker>
                </>
              )}
              {results.map((s) => {
                const station = STATIONS.find(st => st.id === s.id);
                if (!station) return null;
                return (
                  <Marker
                    key={s.id}
                    position={[station.lat, station.lng]}
                    icon={getIcon(s.wait_time_minutes)}
                  >
                    <StationPopup s={s} station={station} onDirections={openGoogleMaps} />
                  </Marker>
                );
              })}
            </MapContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Blue = You | Green = Best | Yellow = Moderate | Red = Avoid
            </p>
          </div>
        )}

        {/* Station Cards */}
        {searched && !loading && results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              {results.length} stations found within {radius} km
              {usedTime && (
                <span className="text-sm font-normal text-gray-400 ml-2">({usedTime})</span>
              )}
            </h2>
            {results.map((s, i) => (
              <div
                key={s.id}
                className={"border-l-4 rounded-xl p-4 mb-3 shadow-sm " + getColor(s.wait_time_minutes)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-base">{"#" + (i + 1) + " " + s.name}</p>
                    <p className="text-sm mt-1">{s.distance} km away | Load: {s.load}%</p>
                    <p className="text-xs mt-1">{getLabel(s.wait_time_minutes)}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-2xl font-bold">{s.wait_time_minutes} min</p>
                    <button
                      onClick={() => openGoogleMaps(s)}
                      className="mt-2 text-xs bg-white border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">How This System Works</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Problem</h3>
            <p className="text-sm text-gray-500">
              Existing EV apps suggest the nearest station, not the best one.
              A nearby station with 90% load and 45 min wait is worse than one 10 km away with 5 min wait.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">ML Model Used</h3>
            <p className="text-sm text-gray-500">
              This system uses a Random Forest algorithm. Two models are trained:
            </p>
            <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
              <li>Classifier predicts if a station is available</li>
              <li>Regressor predicts exact wait time in minutes</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Input Features</h3>
            <ul className="text-sm text-gray-500 mt-1 space-y-1 list-disc list-inside">
              <li>Hour of day (auto-detected)</li>
              <li>Day of week (auto-detected)</li>
              <li>Current station load</li>
              <li>Number of nearby stations</li>
              <li>Distance from user</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">How Prediction Works</h3>
            <p className="text-sm text-gray-500">
              Your location and current time are detected automatically. Only stations within your
              selected radius are considered. The ML model predicts wait time for each nearby station
              and recommends the one with the lowest wait time. Use the Book for Later toggle to
              predict availability for a future date and time.
            </p>
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
    </div>
  );
}
