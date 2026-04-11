import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import MyBookings from "./MyBookings.jsx";
import OwnerLogin from "./OwnerLogin.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);