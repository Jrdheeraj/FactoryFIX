import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "rul_model.pkl"))

def predict_rul(features):
    """
    features: list of sensor values (same order as training)
    """
    prediction = model.predict([features])
    return int(prediction[0])
