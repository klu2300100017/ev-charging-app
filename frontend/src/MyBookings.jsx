import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND = "https://ev-charging-backend-q5ua.onrender.com";

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", color: "#166534", border: "#16a34a" },
  completed: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#dc2626" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    setLoading(true);
    try {
      const res = await axios.get(BACKEND + "/api/my-bookings", {
        headers: { Authorization: "Bearer " + token }
      });
      setBookings(res.data.bookings);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    setLoading(false);
  };

  const upcoming = bookings.filter(b => b.status === "confirmed");
  const past = bookings.filter(b => b.status !== "confirmed");

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "20px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#15803d", margin: 0 }}>My Bookings</h1>
            {user && <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Welcome, {user.name}</p>}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <a href="/" style={{ background: "#16a34a", color: "white", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
              Find Station
            </a>
            <button
              onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}
              style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
            >
              Logout
            </button>
          </div>
        </div>

        {user && (
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "12px", marginTop: 0 }}>My Profile</h3>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Name", value: user.name },
                { label: "Phone", value: user.phone },
                { label: "Vehicle", value: user.vehicle_no },
                { label: "Email", value: user.email },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "2px 0 0 0" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "60px 0" }}>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "50px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>🔋</p>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>No bookings yet.</p>
            <a href="/" style={{ color: "#16a34a", fontWeight: "600", fontSize: "14px" }}>Find a station and book your first slot!</a>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
                  Upcoming ({upcoming.length})
                </h2>
                {upcoming.map(b => <BookingCard key={b.id} b={b} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", marginTop: "24px", marginBottom: "12px" }}>
                  Past Orders ({past.length})
                </h2>
                {past.map(b => <BookingCard key={b.id} b={b} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ b }) {
  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "18px 20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderLeft: "5px solid " + sc.border }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontWeight: "700", fontSize: "15px", color: "#111827" }}>{b.station_name}</span>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: sc.bg, color: sc.color }}>
              {b.status.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#374151", margin: "3px 0" }}>Slot: <strong>{b.slot_time}</strong></p>
          <p style={{ fontSize: "13px", color: "#374151", margin: "3px 0" }}>Vehicle: <strong>{b.vehicle_no}</strong></p>
          <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>Booked on: {b.created_at}</p>
        </div>
        {b.status === "confirmed" && (
          <a
            href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.station_name)}
            target="_blank"
            rel="noreferrer"
            style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #86efac", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Get Directions
          </a>
        )}
      </div>
    </div>
  );
}