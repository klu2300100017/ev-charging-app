import { useState, useEffect } from "react";
import axios from "axios";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_COLORS = {
  confirmed: { bg: "#dcfce7", color: "#166534", border: "#16a34a" },
  completed: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", border: "#dc2626" },
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming"); // "upcoming" | "past"
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://ev-charging-backend-q5ua.onrender.com");
      setBookings(res.data.bookings);
    } catch {
      alert("Could not fetch bookings. Make sure backend is running.");
    }
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    await axios.post("http://localhost:5000/api/bookings/" + id + "/cancel");
    fetchBookings();
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this booking as completed?")) return;
    await axios.post("http://localhost:5000/api/bookings/" + id + "/complete");
    fetchBookings();
  };

  const handleRetrain = async () => {
    if (!window.confirm("Retrain the ML model with current booking data?")) return;
    setRetraining(true);
    setRetrainResult(null);
    try {
      const res = await axios.post("http://localhost:5000/api/retrain");
      setRetrainResult(res.data);
    } catch {
      alert("Retraining failed. Make sure backend is running.");
    }
    setRetraining(false);
  };

  // Split bookings into upcoming (confirmed) and past (completed + cancelled)
  const upcoming = bookings.filter(b => b.status === "confirmed");
  const past = bookings.filter(b => b.status === "completed" || b.status === "cancelled");

  const total = bookings.length;
  const confirmed = upcoming.length;
  const completed = bookings.filter(b => b.status === "completed").length;
  const cancelled = bookings.filter(b => b.status === "cancelled").length;

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#15803d", margin: 0 }}>Owner Dashboard</h1>
            <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Manage all EV charging slot bookings</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={fetchBookings} style={{ background: "#1d4ed8", color: "white", border: "none", borderRadius: "10px", padding: "10px 18px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
              Refresh
            </button>
            <button onClick={handleRetrain} disabled={retraining} style={{ background: retraining ? "#86efac" : "#16a34a", color: "white", border: "none", borderRadius: "10px", padding: "10px 18px", cursor: retraining ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600" }}>
              {retraining ? "Retraining..." : "Retrain Model"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total", value: total, color: "#6b7280" },
            { label: "Upcoming", value: confirmed, color: "#16a34a" },
            { label: "Completed", value: completed, color: "#1d4ed8" },
            { label: "Cancelled", value: cancelled, color: "#dc2626" },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, background: "white", borderRadius: "14px", padding: "16px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <p style={{ fontSize: "28px", fontWeight: "800", color: stat.color, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Retrain result */}
        {retrainResult && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", color: "#15803d", marginBottom: "10px", fontSize: "15px" }}>Model Retrained Successfully!</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { label: "Total Training Rows", value: retrainResult.training_rows },
                { label: "Real Bookings Used", value: retrainResult.booking_rows_used },
                { label: "Availability Accuracy", value: retrainResult.availability_accuracy },
                { label: "Wait Time Error (MAE)", value: retrainResult.wait_time_mae },
              ].map(item => (
                <div key={item.label} style={{ background: "white", borderRadius: "10px", padding: "10px 16px", flex: "1 1 140px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: "18px", fontWeight: "800", color: "#15803d", margin: 0 }}>{item.value}</p>
                  <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs: Upcoming / Past Orders */}
        <div style={{ display: "flex", gap: "0", marginBottom: "20px", background: "#e5e7eb", borderRadius: "12px", padding: "4px" }}>
          {[
            { key: "upcoming", label: "Upcoming Bookings (" + confirmed + ")" },
            { key: "past", label: "Past Orders (" + (completed + cancelled) + ")" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                background: tab === t.key ? "white" : "transparent",
                color: tab === t.key ? "#15803d" : "#6b7280",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: "60px 0", fontSize: "16px" }}>Loading bookings...</p>
        ) : displayed.length === 0 ? (
          <div style={{ background: "white", borderRadius: "14px", padding: "50px", textAlign: "center" }}>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              {tab === "upcoming" ? "No upcoming bookings." : "No past orders yet."}
            </p>
          </div>
        ) : (
          displayed.map(b => {
            const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
            return (
              <div
                key={b.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  marginBottom: "12px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  borderLeft: "5px solid " + sc.border,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>

                    {/* Name + status badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "16px", color: "#111827" }}>{b.user_name}</span>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: sc.bg, color: sc.color }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: "14px", color: "#374151", margin: "3px 0" }}>
                      Station: <strong>{b.station_name}</strong>
                    </p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: "3px 0" }}>
                      Phone: {b.phone} &nbsp;|&nbsp; Vehicle: <strong>{b.vehicle_no}</strong>
                    </p>
                    <p style={{ fontSize: "14px", color: "#374151", margin: "3px 0" }}>
                      Slot: <strong>{b.slot_time}</strong>
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "3px 0" }}>
                      Hour: {b.hour_of_day}:00 &nbsp;|&nbsp;
                      Day: {DAYS[b.day_of_week] || "N/A"} &nbsp;|&nbsp;
                      Load at booking: {b.load_at_booking}%
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>
                      Booked on: {b.created_at}
                    </p>
                  </div>

                  {/* Action buttons */}
                  {b.status === "confirmed" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "16px" }}>
                      <button
                        onClick={() => handleComplete(b.id)}
                        style={{ background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}