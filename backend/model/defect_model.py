import joblib
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "defect_model.pkl"))

EXPECTED_FEATURES = model.n_features_in_

def predict_defect_risk(features):
    if len(features) != EXPECTED_FEATURES:
        raise ValueError(
            f"Expected {EXPECTED_FEATURES} features, got {len(features)}"
        )

    prob = model.predict_proba([features])
    return round(prob[0][1] * 100, 2)
