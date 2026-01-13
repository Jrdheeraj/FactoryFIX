import pandas as pd
import random
import os

def generate_factory_data(rows=500):
    data = []

    for _ in range(rows):
        temperature = random.randint(50, 100)
        vibration = round(random.uniform(0.2, 2.5), 2)
        runtime = random.randint(1, 24)

        defect = 1 if (temperature > 85 and vibration > 1.5) else 0

        data.append({
            "temperature": temperature,
            "vibration": vibration,
            "runtime_hours": runtime,
            "defect": defect
        })

    return pd.DataFrame(data)

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    os.makedirs(DATA_DIR, exist_ok=True)

    df = generate_factory_data()
    csv_path = os.path.join(DATA_DIR, "factory_data.csv")
    df.to_csv(csv_path, index=False)

    print(f"Fake factory data generated at: {csv_path}")
    print(df.head())
