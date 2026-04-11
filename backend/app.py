from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import joblib
import numpy as np
import mysql.connector
import bcrypt
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "ev-charging-super-secret-key-2026"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)

clf = joblib.load('model_avail.pkl')
reg = joblib.load('model_wait.pkl')

def get_db():
    return mysql.connector.connect(
        host="mainline.proxy.rlwy.net",
        user="root",
        password="SrxozRUfVJqEoeGKefcdsPAYtLgATgUM",
        database="railway",
        port=31614
    )

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    required = ['name', 'phone', 'vehicle_no', 'email', 'password']
    for field in required:
        if not data.get(field):
            return jsonify({"error": "Missing field: " + field}), 400

    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (name, phone, vehicle_no, email, password)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['name'], data['phone'], data['vehicle_no'], data['email'], hashed))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Registration successful!"})
    except mysql.connector.errors.IntegrityError:
        return jsonify({"error": "Email already registered."}), 409

# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required."}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Email not found."}), 404

    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Incorrect password."}), 401

    token = create_access_token(identity=str(user['id']))
    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "phone": user['phone'],
            "vehicle_no": user['vehicle_no'],
            "email": user['email'],
        }
    })

# ---------------------------------------------------------------------------
# Get current user profile
# ---------------------------------------------------------------------------
@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, phone, vehicle_no, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user})

# ---------------------------------------------------------------------------
# ML Prediction — uses live load from stations table
# ---------------------------------------------------------------------------
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    hour = data['hour']
    day = data['day_of_week']
    stations = data['stations']

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    results = []
    for station in stations:
        # Fetch live load from stations table
        cursor.execute("SELECT current_load FROM stations WHERE id = %s", (station['id'],))
        row = cursor.fetchone()
        live_load = row['current_load'] if row else station['load']

        features = np.array([[
            hour,
            day,
            live_load,
            station['nearby'],
            station['distance']
        ]])

        is_available = int(clf.predict(features)[0])
        wait_time = round(float(reg.predict(features)[0]), 1)

        results.append({
            'id': station['id'],
            'name': station['name'],
            'is_available': is_available,
            'wait_time_minutes': wait_time,
            'load': live_load,
            'distance': station['distance']
        })

    cursor.close()
    conn.close()

    max_wait = max(r['wait_time_minutes'] for r in results) or 1
    max_dist = max(r['distance'] for r in results) or 1

    for r in results:
        r['score'] = 0.6 * (r['wait_time_minutes'] / max_wait) + 0.4 * (r['distance'] / max_dist)

    results.sort(key=lambda x: x['score'])
    return jsonify({"stations": results})

# ---------------------------------------------------------------------------
# Book a slot — increases station load by 5%
# ---------------------------------------------------------------------------
@app.route('/api/book', methods=['POST'])
@jwt_required()
def book_slot():
    user_id = get_jwt_identity()
    data = request.get_json()

    required = ['station_id', 'station_name', 'slot_time']
    for field in required:
        if not data.get(field):
            return jsonify({"error": "Missing field: " + field}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    # Insert booking
    cursor.execute("""
        INSERT INTO bookings (
            station_id, station_name, user_name, phone, vehicle_no, slot_time,
            hour_of_day, day_of_week, load_at_booking, nearby_stations, distance_km, user_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data['station_id'],
        data['station_name'],
        user['name'],
        user['phone'],
        user['vehicle_no'],
        data['slot_time'],
        data.get('hour_of_day', 0),
        data.get('day_of_week', 0),
        data.get('load_at_booking', 70),
        data.get('nearby_stations', 2),
        data.get('distance_km', 1.0),
        user_id,
    ))

    # Increase station load by 5% (max 100)
    cursor.execute(
        "UPDATE stations SET current_load = LEAST(current_load + 5, 100) WHERE id = %s",
        (data['station_id'],)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Slot booked successfully!"})

# ---------------------------------------------------------------------------
# Get bookings for logged-in user
# ---------------------------------------------------------------------------
@app.route('/api/my-bookings', methods=['GET'])
@jwt_required()
def my_bookings():
    user_id = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM bookings WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    for row in rows:
        if isinstance(row.get('created_at'), datetime):
            row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({"bookings": rows})

# ---------------------------------------------------------------------------
# Get all bookings (owner)
# ---------------------------------------------------------------------------
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bookings ORDER BY created_at DESC")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    for row in rows:
        if isinstance(row.get('created_at'), datetime):
            row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({"bookings": rows})

# ---------------------------------------------------------------------------
# Cancel a booking — decreases station load by 5%
# ---------------------------------------------------------------------------
@app.route('/api/bookings/<int:booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Get station_id before cancelling
    cursor.execute("SELECT station_id FROM bookings WHERE id = %s", (booking_id,))
    booking = cursor.fetchone()

    cursor.execute("UPDATE bookings SET status = 'cancelled' WHERE id = %s", (booking_id,))

    # Decrease station load by 5% (min 0)
    if booking:
        cursor.execute(
            "UPDATE stations SET current_load = GREATEST(current_load - 5, 0) WHERE id = %s",
            (booking['station_id'],)
        )

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Booking cancelled"})

# ---------------------------------------------------------------------------
# Complete a booking — decreases station load by 5%
# ---------------------------------------------------------------------------
@app.route('/api/bookings/<int:booking_id>/complete', methods=['POST'])
def complete_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    # Get station_id before completing
    cursor.execute("SELECT station_id FROM bookings WHERE id = %s", (booking_id,))
    booking = cursor.fetchone()

    cursor.execute("UPDATE bookings SET status = 'completed' WHERE id = %s", (booking_id,))

    # Decrease station load by 5% (min 0)
    if booking:
        cursor.execute(
            "UPDATE stations SET current_load = GREATEST(current_load - 5, 0) WHERE id = %s",
            (booking['station_id'],)
        )

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Booking marked as completed"})

# ---------------------------------------------------------------------------
# Retrain model
# ---------------------------------------------------------------------------
@app.route('/api/retrain', methods=['POST'])
def retrain():
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, mean_absolute_error

    np.random.seed(42)
    n = 2000
    data = pd.DataFrame({
        'hour_of_day': np.random.randint(0, 24, n),
        'day_of_week': np.random.randint(0, 7, n),
        'current_load_percent': np.random.randint(0, 101, n),
        'nearby_stations': np.random.randint(1, 10, n),
        'distance_km': np.round(np.random.uniform(0.5, 20.0, n), 2),
    })
    data['wait_time_minutes'] = (
        data['current_load_percent'] * 0.4 +
        data['hour_of_day'].apply(lambda h: 10 if 7 <= h <= 9 or 17 <= h <= 20 else 0) +
        np.random.randint(0, 10, n)
    ).clip(0, 90)
    data['is_available'] = (data['current_load_percent'] < 80).astype(int)

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bookings WHERE status IN ('confirmed', 'completed')")
    bookings = cursor.fetchall()
    cursor.close()
    conn.close()

    new_rows = []
    for b in bookings:
        try:
            hour = int(b.get('hour_of_day') or 0)
            day = int(b.get('day_of_week') or 0)
            load = int(b.get('load_at_booking') or 70)
            nearby = int(b.get('nearby_stations') or 2)
            distance = float(b.get('distance_km') or 1.0)
            wait = round(load * 0.4 + (10 if 7 <= hour <= 9 or 17 <= hour <= 20 else 0), 1)
            wait = min(wait, 90)
            is_avail = 1 if load < 80 else 0
            new_rows.append({
                'hour_of_day': hour, 'day_of_week': day,
                'current_load_percent': load, 'nearby_stations': nearby,
                'distance_km': distance, 'wait_time_minutes': wait, 'is_available': is_avail,
            })
        except Exception:
            continue

    if new_rows:
        new_df = pd.DataFrame(new_rows)
        new_df = pd.concat([new_df] * 10, ignore_index=True)
        data = pd.concat([data, new_df], ignore_index=True)

    features = ['hour_of_day', 'day_of_week', 'current_load_percent', 'nearby_stations', 'distance_km']
    X = data[features]
    y_avail = data['is_available']
    y_wait = data['wait_time_minutes']

    X_train, X_test, ya_train, ya_test, yw_train, yw_test = train_test_split(
        X, y_avail, y_wait, test_size=0.2, random_state=42
    )

    clf_new = RandomForestClassifier(n_estimators=100, random_state=42)
    clf_new.fit(X_train, ya_train)
    avail_acc = round(accuracy_score(ya_test, clf_new.predict(X_test)) * 100, 2)

    reg_new = RandomForestRegressor(n_estimators=100, random_state=42)
    reg_new.fit(X_train, yw_train)
    wait_mae = round(mean_absolute_error(yw_test, reg_new.predict(X_test)), 2)

    joblib.dump(clf_new, 'model_avail.pkl')
    joblib.dump(reg_new, 'model_wait.pkl')

    global clf, reg
    clf = clf_new
    reg = reg_new

    return jsonify({
        "message": "Model retrained successfully!",
        "training_rows": len(data),
        "booking_rows_used": len(new_rows),
        "availability_accuracy": str(avail_acc) + "%",
        "wait_time_mae": str(wait_mae) + " min"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)