import { useState } from "react";
import axios from "axios";

const BACKEND = "https://ev-charging-backend-q5ua.onrender.com";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(BACKEND + "/api/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚡</div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#15803d", margin: 0 }}>EV Charging Finder</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>Sign in to your account</p>
        </div>

        {[
          { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email" },
          { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
        ].map(field => (
          <div key={field.name} style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
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
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>Register here</a>
        </p>
      </div>
    </div>
  );
}