import { useState } from "react";

const OWNER_EMAIL = "owner@evcharging.com";
const OWNER_PASSWORD = "owner@2026";

export default function OwnerLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (form.email === OWNER_EMAIL && form.password === OWNER_PASSWORD) {
      localStorage.setItem("owner_auth", "true");
      window.location.href = "/dashboard";
    } else {
      setError("Invalid owner credentials.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔐</div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: 0 }}>Owner Access</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "6px" }}>Restricted to station owners only</p>
        </div>

        {[
          { label: "Owner Email", name: "email", type: "email", placeholder: "Enter owner email" },
          { label: "Password", name: "password", type: "password", placeholder: "Enter owner password" },
        ].map(field => (
          <div key={field.name} style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={form[field.name]}
              onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
              placeholder={field.placeholder}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
            />
          </div>
        ))}

        {error && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          style={{ width: "100%", background: "#111827", color: "white", fontWeight: "700", padding: "12px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
        >
          Access Dashboard
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
          Not an owner? <a href="/" style={{ color: "#16a34a", textDecoration: "none" }}>Go to main app</a>
        </p>
      </div>
    </div>
  );
}