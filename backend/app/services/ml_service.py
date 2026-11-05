"""
Machine Learning Service: Inference, Feature Engineering & SHAP Explainability
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime, timezone

from backend.app.schemas.ml import RiskPredictionInput, RiskPredictionOutput, SHAPContribution, ModelMetadataOut

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_artifacts")


class MLService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.imputer = None
        self.shap_background = None
        self.metadata = {}
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(ARTIFACTS_DIR, "best_model.joblib")
        scaler_path = os.path.join(ARTIFACTS_DIR, "scaler.joblib")
        imputer_path = os.path.join(ARTIFACTS_DIR, "imputer.joblib")
        bg_path = os.path.join(ARTIFACTS_DIR, "shap_background.joblib")
        meta_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")

        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.imputer = joblib.load(imputer_path)
            self.shap_background = joblib.load(bg_path)
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            print("[MLService] Successfully loaded model and artifacts.")
        else:
            print("[MLService] Warning: ML artifacts not found. Please train model first.")

    def get_metadata(self) -> ModelMetadataOut:
        return ModelMetadataOut(
            dataset=self.metadata.get("dataset", "Pima Indians Diabetes"),
            total_samples=self.metadata.get("total_samples", 768),
            positive_class_ratio=self.metadata.get("positive_class_ratio", 0.349),
            selected_model=self.metadata.get("selected_model", "Random Forest"),
            decision_threshold=self.metadata.get("decision_threshold", 0.45),
            features=self.metadata.get("features", []),
            benchmark_comparison=self.metadata.get("benchmark_comparison", {})
        )

    def predict_risk(self, data: RiskPredictionInput) -> RiskPredictionOutput:
        # 1. Feature DataFrame construction
        raw_dict = {
            "Pregnancies": data.pregnancies,
            "Glucose": data.glucose,
            "BloodPressure": data.blood_pressure,
            "SkinThickness": data.skin_thickness,
            "Insulin": data.insulin,
            "BMI": data.bmi,
            "DiabetesPedigreeFunction": data.diabetes_pedigree_function,
            "Age": data.age,
        }
        df_raw = pd.DataFrame([raw_dict])

        # 2. Imputation check (if any biological zero passed)
        imputed_array = self.imputer.transform(df_raw)
        df_imputed = pd.DataFrame(imputed_array, columns=df_raw.columns)

        # 3. Feature Engineering
        df_imputed["InsulinGlucoseRatio"] = df_imputed["Insulin"] / (df_imputed["Glucose"] + 1e-4)
        df_imputed["BMIAgeInteraction"] = (df_imputed["BMI"] * df_imputed["Age"]) / 100.0
        df_imputed["MAP_Proxy"] = df_imputed["BloodPressure"] * 1.15

        feature_cols = self.metadata.get("features", list(df_imputed.columns))
        df_imputed = df_imputed[feature_cols]

        # 4. Standard Scaling
        X_scaled = self.scaler.transform(df_imputed)
        df_scaled = pd.DataFrame(X_scaled, columns=feature_cols)

        # 5. Model Inference
        prob = float(self.model.predict_proba(df_scaled)[0, 1])

        # 6. SHAP Value Attribution
        # TreeExplainer feature attributions
        shap_contributions: List[SHAPContribution] = []
        try:
            import shap
            explainer = shap.TreeExplainer(self.model, data=self.shap_background)
            shap_values = explainer(df_scaled)
            vals = shap_values.values[0]
            if len(vals.shape) == 2: # Binary classification tree explainer shape (features, 2)
                vals = vals[:, 1]

            label_map = {
                "Glucose": "Fasting Plasma Glucose",
                "BMI": "Body Mass Index (BMI)",
                "Age": "Patient Age",
                "DiabetesPedigreeFunction": "Genetic Pedigree Score",
                "InsulinGlucoseRatio": "Insulin-to-Glucose Index",
                "BMIAgeInteraction": "Adiposity-Age Interaction",
                "BloodPressure": "Diastolic Blood Pressure",
                "Insulin": "2-Hour Serum Insulin",
                "SkinThickness": "Triceps Skinfold",
                "Pregnancies": "Pregnancy Count",
                "MAP_Proxy": "Mean Arterial Pressure Proxy",
            }

            total_abs_shap = np.sum(np.abs(vals)) + 1e-6
            for idx, col in enumerate(feature_cols):
                sv = float(vals[idx])
                raw_val = float(df_imputed[col].iloc[0])
                impact_dir = "INCREASES_RISK" if sv > 0 else "DECREASES_RISK"
                pct = round((abs(sv) / total_abs_shap) * 100.0, 1)

                shap_contributions.append(
                    SHAPContribution(
                        feature=col,
                        feature_label=label_map.get(col, col),
                        feature_value=round(raw_val, 2),
                        shap_value=round(sv, 4),
                        impact_direction=impact_dir,
                        impact_percentage=pct,
                    )
                )

            # Sort by highest absolute impact
            shap_contributions.sort(key=lambda item: abs(item.shap_value), reverse=True)
        except Exception as e:
            print(f"[MLService] SHAP generation fallback: {e}")
            # Fallback simple contribution based on feature weights
            pass

        # 7. Risk Categorization
        if prob < 0.20:
            category = "LOW"
            clinical_advice = "Metabolic markers are within optimal ranges. Recommend maintaining balanced dietary fiber intake, regular aerobic activity, and routine annual health screening."
        elif prob < 0.45:
            category = "MODERATE"
            clinical_advice = "Borderline metabolic risk indicators observed. Suggest lifestyle modifications, monitoring carbohydrate tolerance, and scheduling an HbA1c screening."
        elif prob < 0.75:
            category = "HIGH"
            clinical_advice = "Significant statistical likelihood of pre-diabetes or impaired glucose tolerance. Recommend comprehensive clinical consultation, fasting lipid panel, and lifestyle intervention."
        else:
            category = "CRITICAL"
            clinical_advice = "Elevated multi-parameter risk detected. Immediate medical evaluation recommended for formal diagnostic testing (OGTT / HbA1c) and clinician-guided management."

        disclaimer = (
            "NOTICE: This assessment is an automated AI risk estimation designed for research and decision support only. "
            "It does NOT constitute a clinical diagnosis or treatment prescription. Always consult a licensed healthcare professional."
        )

        return RiskPredictionOutput(
            model_name=self.metadata.get("selected_model", "Random Forest Ensemble"),
            risk_score=round(prob, 4),
            risk_percentage=round(prob * 100.0, 1),
            risk_category=category,
            clinical_summary=clinical_advice,
            disclaimer=disclaimer,
            shap_contributions=shap_contributions,
            created_at=datetime.now(timezone.utc),
        )


ml_service = MLService()
