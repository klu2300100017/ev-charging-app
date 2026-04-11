# ⚡ Predictive EV Charging Station Recommendation System

[![Frontend](https://img.shields.io/badge/Frontend-React.js-blue)](https://reactjs.org)
[![Backend](https://img.shields.io/badge/Backend-Python%20Flask-green)](https://flask.palletsprojects.com)
[![ML](https://img.shields.io/badge/ML-Random%20Forest-orange)](https://scikit-learn.org)
[![Database](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com)

> **85% Availability Accuracy** • **2.8 min Wait Time Error** • **Real-time GPS** • **Self-improving Model**

---

## Introduction

**EV Charging Finder** is a full-stack intelligent web application that predicts the **optimal** EV charging station for a user — not just the nearest one.

Existing systems suggest the closest station regardless of congestion or wait time. This system uses a **Random Forest ML model** that considers real-time load, distance, hour of day, and day of week to rank stations by a combined smart score — and gets smarter with every real booking made.

---

## 🔥 Key Highlights

- 97% Availability Accuracy on trained model
- 2.8 min MAE on wait time prediction
- Self-improving — model retrains with real booking data from the owner dashboard
- 30+ stations across Telangana and Andhra Pradesh
- JWT-secured user authentication with bcrypt password hashing

---

## ✨ Features

**User Side**
- 📍 Real-time GPS location detection
- 🕐 Auto-detects current time and day of week
- 📅 Book for Later — select any future date and time
- 📊 Bar chart showing wait time comparison across stations
- 🎫 Slot booking with auto-filled profile details
- 👤 Register and login with JWT authentication
- 📋 Personal booking history

**Owner Dashboard**
- 🔐 Separate protected owner login
- 📋 View all bookings with full details
- ✅ Mark bookings as Completed
- ❌ Cancel bookings
- 📁 Filter by Upcoming and Past Orders
- 🤖 Retrain ML model with one click using real booking data
- 📈 Live accuracy stats after retraining

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Python, Flask, Flask-CORS |
| ML Model | Random Forest — scikit-learn |
| Database | MySQL |
| Auth | JWT tokens + bcrypt |

---

## 🧠 How the ML Model Works

1. Trained on 2000 synthetic data points simulating real station behaviour
2. Features used: `hour_of_day`, `day_of_week`, `current_load_percent`, `nearby_stations`, `distance_km`
3. Random Forest Classifier predicts availability (0 or 1)
4. Random Forest Regressor predicts wait time in minutes
5. Stations ranked by: 60% wait time + 40% distance (normalized score)
6. Every confirmed booking is added as real training data, weighted 10x over synthetic rows

---

## 🗺 Coverage

**Hyderabad** — Hitech City, Gachibowli, Jubilee Hills, Madhapur, Banjara Hills, Secunderabad, Kukatpally, LB Nagar, Uppal, Mehdipatnam

**Telangana** — Warangal, Karimnagar, Nizamabad, Khammam, Nalgonda, Mahbubnagar

**Vijayawada** — Benz Circle, Governorpet, Patamata, Moghalrajpuram, Junction

**Andhra Pradesh** — Visakhapatnam, Guntur, Tirupati, Nellore, Kurnool, Rajahmundry, Kadapa, Anantapur

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/predict` | Get ranked station predictions |
| POST | `/api/book` | Book a charging slot |
| GET | `/api/bookings` | All bookings (owner) |
| POST | `/api/retrain` | Retrain ML model |
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| GET | `/api/my-bookings` | User's own bookings |

---

## 🔒 Security

- Passwords stored as bcrypt hashes — never in plain text
- Routes protected using JWT tokens with 24hr expiry
- Owner dashboard on a completely separate protected route

---

## 🎓 Project Info

**Title:** Predictive EV Charging Station Recommendation System
**Author:** Jashwanth Etla
**College:** KL UNIVERSITY
**Year:** 3rd YEAR

---
