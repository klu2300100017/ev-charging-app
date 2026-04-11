import { useState } from "react";
import axios from "axios";

const BACKEND = "https://ev-charging-backend-q5ua.onrender.com";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", vehicle_no: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.vehicle_no || !form.email || !form.password) {
      setError("Please fill all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(BACKEND + "/api/register", {
        name: form.name, phone: form.phone,
        vehicle_no: form.vehicle_no, email: form.email, password: form.password
      });
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "440px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚡</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#15803d", margin: 0 }}>Create Account</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>Register once, book anytime</p>
        </div>

        {[
          { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name" },
          { label: "Phone Number", name: "phone", type: "tel", placeholder: "Enter your phone number" },
          { label: "Vehicle Number", name: "vehicle_no", type: "text", placeholder: "e.g. TS09EX1234" },
          { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email" },
          { label: "Password", name: "password", type: "password", placeholder: "Min 6 characters" },
          { label: "Confirm Password", name: "confirm", type: "password", placeholder: "Re-enter your password" },
        ].map(field => (
          <div key={field.name} style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
            />
          </div>
        ))}

        {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: loading ? "#86efac" : "#16a34a", color: "white", fontWeight: "700", padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px", marginBottom: "16px" }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}