from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import mysql.connector
from datetime import datetime

app = Flask(__name__)
CORS(app)

clf = joblib.load('model_avail.pkl')
reg = joblib.load('model_wait.pkl')

# ---------------------------------------------------------------------------
# MySQL connection
# ---------------------------------------------------------------------------
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
# ML Prediction
# ---------------------------------------------------------------------------
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    hour = data['hour']
    day = data['day_of_week']
    stations = data['stations']

    results = []
    for station in stations:
        features = np.array([[
            hour,
            day,
            station['load'],
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
            'load': station['load'],
            'distance': station['distance']
        })

    results.sort(key=lambda x: x['wait_time_minutes'])
    return jsonify({"stations": results})

# ---------------------------------------------------------------------------
# Book a slot
# ---------------------------------------------------------------------------
@app.route('/api/book', methods=['POST'])
def book_slot():
    data = request.get_json()

    required = ['station_id', 'station_name', 'user_name', 'phone', 'vehicle_no', 'slot_time']
    for field in required:
        if not data.get(field):
            return jsonify({"error": "Missing field: " + field}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO bookings (
            station_id, station_name, user_name, phone, vehicle_no, slot_time,
            hour_of_day, day_of_week, load_at_booking, nearby_stations, distance_km
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data['station_id'],
        data['station_name'],
        data['user_name'],
        data['phone'],
        data['vehicle_no'],
        data['slot_time'],
        data.get('hour_of_day', 0),
        data.get('day_of_week', 0),
        data.get('load_at_booking', 70),
        data.get('nearby_stations', 2),
        data.get('distance_km', 1.0),
    ))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Slot booked successfully!"})

# ---------------------------------------------------------------------------
# Get all bookings
# ---------------------------------------------------------------------------
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    station_id = request.args.get('station_id')
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    if station_id:
        cursor.execute(
            "SELECT * FROM bookings WHERE station_id = %s ORDER BY created_at DESC",
            (station_id,)
        )
    else:
        cursor.execute("SELECT * FROM bookings ORDER BY created_at DESC")

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    for row in rows:
        if isinstance(row.get('created_at'), datetime):
            row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({"bookings": rows})

# ---------------------------------------------------------------------------
# Cancel a booking
# ---------------------------------------------------------------------------
@app.route('/api/bookings/<int:booking_id>/cancel', methods=['POST'])
def cancel_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id = %s",
        (booking_id,)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Booking cancelled"})

# ---------------------------------------------------------------------------
# Mark a booking as completed
# ---------------------------------------------------------------------------
@app.route('/api/bookings/<int:booking_id>/complete', methods=['POST'])
def complete_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE bookings SET status = 'completed' WHERE id = %s",
        (booking_id,)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Booking marked as completed"})

# ---------------------------------------------------------------------------
# Retrain model with real booking data
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

            wait = round(
                load * 0.4 +
                (10 if 7 <= hour <= 9 or 17 <= hour <= 20 else 0),
                1
            )
            wait = min(wait, 90)
            is_avail = 1 if load < 80 else 0

            new_rows.append({
                'hour_of_day': hour,
                'day_of_week': day,
                'current_load_percent': load,
                'nearby_stations': nearby,
                'distance_km': distance,
                'wait_time_minutes': wait,
                'is_available': is_avail,
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