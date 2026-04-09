import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error
import joblib

# Generate synthetic dataset
np.random.seed(42)
n = 2000

data = pd.DataFrame({
    'hour_of_day': np.random.randint(0, 24, n),
    'day_of_week': np.random.randint(0, 7, n),
    'current_load_percent': np.random.randint(0, 101, n),
    'nearby_stations': np.random.randint(1, 10, n),
    'distance_km': np.round(np.random.uniform(0.5, 20.0, n), 2),
})

# Simulate wait time based on load
data['wait_time_minutes'] = (
    data['current_load_percent'] * 0.4 +
    data['hour_of_day'].apply(lambda h: 10 if 7 <= h <= 9 or 17 <= h <= 20 else 0) +
    np.random.randint(0, 10, n)
).clip(0, 90)

# Availability: available if load < 80
data['is_available'] = (data['current_load_percent'] < 80).astype(int)

features = ['hour_of_day', 'day_of_week', 'current_load_percent', 'nearby_stations', 'distance_km']

X = data[features]
y_avail = data['is_available']
y_wait = data['wait_time_minutes']

X_train, X_test, ya_train, ya_test, yw_train, yw_test = train_test_split(
    X, y_avail, y_wait, test_size=0.2, random_state=42
)

# Train availability classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, ya_train)
print(f"Availability Accuracy: {accuracy_score(ya_test, clf.predict(X_test)):.2f}")

# Train wait time regressor
reg = RandomForestRegressor(n_estimators=100, random_state=42)
reg.fit(X_train, yw_train)
print(f"Wait Time MAE: {mean_absolute_error(yw_test, reg.predict(X_test)):.2f} minutes")

# Save models
joblib.dump(clf, 'model_avail.pkl')
joblib.dump(reg, 'model_wait.pkl')
print("Models saved successfully!")