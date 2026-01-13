# FactoryFix AI

AI-Powered Manufacturing Intelligence Platform

FactoryFix AI is an industrial machine learning system designed to monitor machine health, predict failures, estimate remaining useful life (RUL), and assess product defect risk using data-driven intelligence. The platform supports predictive and preventive maintenance by converting operational data into actionable insights.

---

## Overview

Modern manufacturing environments generate large volumes of operational and sensor data. However, transforming this data into meaningful intelligence remains a challenge. FactoryFix AI addresses this problem by applying trained machine learning models to production data and producing interpretable health indicators and risk assessments.

The system follows production-grade machine learning practices, with a clear separation between offline model training and online inference to ensure stable and repeatable results.

---

## Core Capabilities

* Machine failure risk prediction based on operational parameters
* Product defect probability estimation
* Remaining useful life (RUL) prediction for machines
* Unified machine health score computation
* Analytics and visualization through a web-based interface

---

## Machine Learning Approach

FactoryFix AI uses multiple specialized machine learning models, each designed for a specific analytical task:

* **Machine Failure Prediction Model**
  Predicts the probability of machine failure using sensor and usage features.

* **Product Defect Prediction Model**
  Estimates the likelihood of defects in manufactured output.

* **Remaining Useful Life (RUL) Model**
  Predicts the remaining operational time before maintenance is required.

All models are trained offline using historical datasets and stored as serialized artifacts. During system execution, models operate strictly in inference mode to ensure deterministic and consistent outputs.

---

## Training and Inference Design

Training and inference are intentionally separated to follow industry-aligned machine learning practices.

**Training Phase**

* Conducted offline using Google Colab
* Includes data preprocessing, feature engineering, and model training
* Produces trained model artifacts

**Inference Phase**

* Loads pre-trained models
* Applies the same preprocessing logic used during training
* Generates predictions without retraining

This design ensures reproducibility and operational stability.

---

## System Architecture

```
Input Data (CSV)
      ↓
Preprocessing and Feature Scaling
      ↓
Machine Learning Inference
      ↓
Health Score Computation
      ↓
Analytics and Visualization
```

---

## Health Score Logic

The overall machine health score is computed using a weighted combination of:

* Machine failure risk
* Product defect probability
* Remaining useful life (RUL)

Based on this score, machines are categorized into health states such as Healthy, Warning, or Critical to support maintenance and operational decision-making.

---

## Technology Stack

* Python
* Scikit-learn
* Pandas and NumPy
* Joblib
* Google Colab for offline training
* React and Vite for frontend development

---

## How to Run the Project

### Prerequisites

* Python 3.9 or higher
* Node.js 18 or higher
* npm

---

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend starts locally and loads pre-trained models for inference.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```
http://localhost:8080/
```

---

## Usage

1. Provide machine data in CSV format
2. The backend performs preprocessing and model inference
3. Predictions are aggregated into health scores
4. Results are visualized through the frontend interface

---

## Design Principles

* Deterministic and repeatable inference pipeline
* Clear separation between training and deployment
* Modular and maintainable system design
* Production-ready machine learning workflow

---

## License

This project is licensed under the **Apache License, Version 2.0**.
See the `LICENSE` file for full license details.