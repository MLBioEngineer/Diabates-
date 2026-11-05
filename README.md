# GlycoPulse AI: Diabetes Prediction & Real-Time Health Monitoring Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%2B-black.svg)](https://nextjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4%2B-F7931E.svg)](https://scikit-learn.org/)
[![XGBoost](https://img.shields.io/badge/XGBoost-Enabled-red.svg)](https://xgboost.readthedocs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, research-oriented **Clinical Decision Support System (CDSS) prototype** and **Continuous Glucose Monitoring (CGM) Telemetry Platform**. GlycoPulse AI bridges epidemiological machine learning risk prediction with high-frequency physiological streaming telemetry.

---

> ### ⚠️ Clinical Decision Support System (CDSS) Regulatory Notice
> This platform is engineered for investigative research, clinical decision support, and patient telemetry education.
> - **NOT an FDA-cleared diagnostic device** (e.g., FDA Class II/III or EU MDR SaMD).
> - Risk estimations do **not** substitute for laboratory HbA1c testing or physician consultations.
> - Telemetry streams maintain strict **provenance tagging** (`SIMULATED`, `DEXCOM_G7`, `ABBOTT_FREESTYLE`, `MANUAL`) ensuring simulated data is never conflated with real patient hardware.
> - The system does not automate insulin bolus deliveries or medication changes without clinician confirmation.

---

## 🌟 Key Capabilities

1. **Multi-Model Diabetes Risk Prediction**:
   - Compares **Logistic Regression, Random Forest, XGBoost, Support Vector Machine (SVM), and LightGBM**.
   - Biologically missing values handled via **KNN / MICE Multivariate Imputation**.
   - Stratified 5-Fold Cross Validation prioritizing **PR-AUC and Clinical Sensitivity (Recall)**.
   - Local feature attribution via **SHAP (SHapley Additive exPlanations)** waterfall graphs.
2. **Real-Time Continuous Glucose Monitoring (CGM)**:
   - Low-latency WebSocket telemetry hub (`/ws/live-telemetry`).
   - Physiological simulation engine incorporating circadian diurnal baselines, postprandial glycemic excursions, and physical exertion drops.
   - Early warning alert triggers (Level 1 & Level 2 Hypoglycemia, Hyperglycemia, Tachycardia, Hypoxia).
3. **Continuous Glucose Integration Architecture**:
   - Ready integration drivers for **Dexcom API v3** (OAuth2 Egv) and **Abbott FreeStyle LibreView** partner webhooks.
4. **Ambulatory Glucose Profile (AGP) Analytics**:
   - Time-in-Range (**TIR 70–180 mg/dL**, target >70%).
   - Time-Below-Range (**TBR <70 mg/dL**, target <4%).
   - Time-Above-Range (**TAR >180 mg/dL**, target <25%).
   - Mean Interstitial Glucose & Glucose Management Indicator (**GMI / Estimated A1c**).
   - Glycemic Variability Coefficient of Variation (**%CV**, target $\le 36\%$).
5. **Role-Based Access Control (RBAC)**:
   - Dedicated **Patient Dashboard** and **Clinician / Doctor Triage Portal**.
   - Clinician cohort triage sorting patients by risk categories and active unacknowledged alerts.
6. **Clinical Health Reporting & Data Export**:
   - Standardized printable AGP health reports and raw CSV telemetry export.

---

## 🔬 Machine Learning Benchmark Results

Evaluated on the benchmark dataset using Stratified 5-Fold Cross Validation with threshold calibration:

| Model Algorithm | ROC-AUC | PR-AUC | Recall (Sensitivity) | Specificity | F1-Score | Precision | False Negatives (FN) |
|---|---|---|---|---|---|---|---|
| **Random Forest (Selected)** | **0.8340** | **0.6975** | **0.8246 (82.5%)** | **0.6940** | **0.6885** | 0.5909 | **47 / 268 (Lowest Misses)** |
| Logistic Regression | 0.8371 | 0.7097 | 0.7910 (79.1%) | 0.7240 | 0.6861 | 0.6057 | 56 / 268 |
| XGBoost | 0.8237 | 0.6851 | 0.6343 (63.4%) | 0.8020 | 0.6331 | 0.6320 | 98 / 268 |
| Support Vector Machine (RBF) | 0.8204 | 0.6744 | 0.6530 (65.3%) | 0.7960 | 0.6422 | 0.6318 | 93 / 268 |
| LightGBM | 0.8206 | 0.6719 | 0.6231 (62.3%) | 0.8060 | 0.6278 | 0.6326 | 101 / 268 |

*Selection Rationale: Random Forest achieved the highest clinical Sensitivity (82.5%), minimizing false negatives (missed at-risk pre-diabetic patients) while maintaining strong PR-AUC and ROC-AUC.*

---

## 🏗️ System Architecture

```
D:\Diabates\
├── backend/
│   ├── app/
│   │   ├── main.py                     # ASGI FastAPI entrypoint & WebSockets
│   │   ├── core/                       # Config, Security (bcrypt/JWT), Async DB
│   │   ├── models/                     # SQLAlchemy Models (User, Patient, Telemetry, Alert)
│   │   ├── schemas/                    # Pydantic v2 DTOs
│   │   ├── services/                   # ML Inference, Simulation Engine, CGM Adapter
│   │   └── api/v1/                     # Auth, Telemetry, ML, Alerts, Reports, Doctor
│   ├── ml_artifacts/                   # Serialized Random Forest model, scaler, SHAP
│   ├── tests/                          # Automated Pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                        # 11 Next.js 14 App Router Pages
│   │   ├── components/                 # Recharts Trend, TIR Donut, SHAP Waterfall
│   │   └── lib/                        # API client, WebSocket adapter, Types
│   ├── package.json
│   └── tailwind.config.js
└── ml_pipeline/                        # Dataset & Benchmark Training Suite
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Startup

```bash
# Navigate to workspace
cd D:\Diabates

# Activate virtual environment
.\venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Run backend tests
python -m pytest backend/tests/test_api.py -v

# Start FastAPI ASGI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup & Startup

```bash
# Open new terminal and navigate to frontend
cd D:\Diabates\frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```
Web Application will be live at: `http://localhost:3000`

---

## 🔑 Default Demo Accounts

The application automatically seeds default accounts on first startup:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Patient** | `patient@demo.com` | `patient123` | Patient Dashboard, Continuous Waveform, Risk Assessment |
| **Doctor / Clinician** | `doctor@demo.com` | `doctor123` | Clinician Triage Portal, Multi-Patient Surveillance |

---

## 📄 License
This project is open-source under the MIT License.
