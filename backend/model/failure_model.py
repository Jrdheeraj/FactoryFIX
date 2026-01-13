import joblib
import numpy as np
import os

# Get absolute path to model folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "machine_failure_model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
encoder = joblib.load(os.path.join(BASE_DIR, "machine_type_encoder.pkl"))


def predict_failure_risk(
    machine_type: str,
    air_temp: float,
    process_temp: float,
    rpm: float,
    torque: float,
    tool_wear: float
):
    # Encode machine type (L/M/H)
    machine_type_encoded = encoder.transform([machine_type])[0]

    # Prepare input in correct order
    input_data = np.array([[
        machine_type_encoded,
        air_temp,
        process_temp,
        rpm,
        torque,
        tool_wear
    ]])

    # Scale input
    input_scaled = scaler.transform(input_data)

    # Predict probability
    failure_probability = model.predict_proba(input_scaled)[0][1]

    return round(failure_probability * 100, 2)
