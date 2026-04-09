from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

clf = joblib.load('model_avail.pkl')
reg = joblib.load('model_wait.pkl')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)