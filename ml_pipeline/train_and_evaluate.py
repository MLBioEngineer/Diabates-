"""
AI-Powered Diabetes Prediction & Real-Time Health Monitoring Platform
ML Pipeline: Rigorous Training, Evaluation, Model Selection & SHAP Explainer
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)

# Algorithms
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
import shap


DATASET_PATH = "ml_pipeline/datasets/pima_indians_diabetes.csv"
ARTIFACTS_DIR = "backend/app/ml_artifacts"


def load_and_preprocess_data(filepath: str) -> Tuple[pd.DataFrame, pd.Series, KNNImputer, StandardScaler, list]:
    df = pd.read_csv(filepath)

    # 1. Replace biologically invalid 0 values with NaN
    # Glucose, BloodPressure, SkinThickness, Insulin, BMI cannot be 0 in viable humans
    zero_invalid_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
    for col in zero_invalid_cols:
        df[col] = df[col].replace(0, np.nan)

    X = df.drop(columns=["Outcome"]).copy()
    y = df["Outcome"].copy()

    # 2. Impute missing values using KNNImputer (Multivariate pattern matching)
    imputer = KNNImputer(n_neighbors=5, weights="distance")
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

    # 3. Feature Engineering
    # - Insulin-to-Glucose ratio (surrogate index for acute insulin resistance)
    X_imputed["InsulinGlucoseRatio"] = X_imputed["Insulin"] / (X_imputed["Glucose"] + 1e-4)
    # - Age * BMI interaction index (adiposity-age risk synergy)
    X_imputed["BMIAgeInteraction"] = (X_imputed["BMI"] * X_imputed["Age"]) / 100.0
    # - Mean Arterial Pressure (MAP) estimation: (2*DBP + SBP)/3, here BloodPressure represents diastolic
    X_imputed["MAP_Proxy"] = X_imputed["BloodPressure"] * 1.15

    feature_names = list(X_imputed.columns)

    # 4. Standard Scaler
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X_imputed), columns=feature_names)

    return X_scaled, y, imputer, scaler, feature_names


def calculate_clinical_metrics(y_true, y_pred, y_prob) -> Dict[str, Any]:
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0) # Sensitivity
    f1 = f1_score(y_true, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_true, y_prob)
    pr_auc = average_precision_score(y_true, y_prob)

    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0 # Specificity

    return {
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall_sensitivity": round(float(rec), 4),
        "specificity": round(float(spec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
    }


def benchmark_models(X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, C=0.5, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=300, max_depth=6, class_weight="balanced", random_state=42),
        "XGBoost": XGBClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, eval_metric="logloss", random_state=42),
        "Support Vector Machine": SVC(probability=True, kernel="rbf", C=1.0, class_weight="balanced", random_state=42),
        "LightGBM": LGBMClassifier(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42, verbose=-1),
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    benchmark_results = {}

    print("=" * 80)
    print("STARTING STRATIFIED 5-FOLD CROSS VALIDATION BENCHMARK ACROSS 5 ALGORITHMS")
    print("=" * 80)

    for name, model in models.items():
        oof_preds = np.zeros(len(y))
        oof_probs = np.zeros(len(y))

        for train_idx, val_idx in skf.split(X, y):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

            model.fit(X_train, y_train)
            val_probs = model.predict_proba(X_val)[:, 1]
            oof_probs[val_idx] = val_probs
            oof_preds[val_idx] = (val_probs >= 0.45).astype(int) # Calibrated decision threshold

        metrics = calculate_clinical_metrics(y, oof_preds, oof_probs)
        benchmark_results[name] = metrics

        print(f"\nModel: {name}")
        print(f"  ROC-AUC: {metrics['roc_auc']:.4f} | PR-AUC: {metrics['pr_auc']:.4f}")
        print(f"  Recall (Sensitivity): {metrics['recall_sensitivity']:.4f} | Specificity: {metrics['specificity']:.4f}")
        print(f"  F1: {metrics['f1_score']:.4f} | Precision: {metrics['precision']:.4f} | Accuracy: {metrics['accuracy']:.4f}")
        print(f"  Confusion Matrix: TN={metrics['confusion_matrix']['true_negatives']}, FP={metrics['confusion_matrix']['false_positives']}, FN={metrics['confusion_matrix']['false_negatives']}, TP={metrics['confusion_matrix']['true_positives']}")

    # Model Selection: We prioritize PR-AUC and Sensitivity (to avoid missing true at-risk cases in clinical screening)
    # Combined Composite Score = 0.5 * PR-AUC + 0.3 * Recall + 0.2 * ROC-AUC
    ranked_models = sorted(
        benchmark_results.items(),
        key=lambda item: (0.5 * item[1]["pr_auc"] + 0.3 * item[1]["recall_sensitivity"] + 0.2 * item[1]["roc_auc"]),
        reverse=True,
    )

    best_model_name = ranked_models[0][0]
    print("\n" + "=" * 80)
    print(f"SELECTED OPTIMAL MODEL: {best_model_name}")
    print(f"Rationale: Highest clinical sensitivity and precision-recall trade-off (Composite Score prioritized).")
    print("=" * 80)

    return benchmark_results, best_model_name, models[best_model_name]


def train_and_export_pipeline():
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # 1. Preprocessing & Feature Engineering
    X, y, imputer, scaler, feature_names = load_and_preprocess_data(DATASET_PATH)

    # 2. Benchmark & Select Best Model
    benchmark_results, best_name, best_model_instance = benchmark_models(X, y)

    # 3. Train final selected model on entire dataset
    best_model_instance.fit(X, y)

    # 4. Fit SHAP Explainer
    print("\nFitting SHAP Explainer on selected model...")
    # Background reference sample for fast tree/kernel explanations
    background_sample = X.sample(min(100, len(X)), random_state=42)
    
    if isinstance(best_model_instance, (RandomForestClassifier, XGBClassifier, LGBMClassifier)):
        shap_explainer = shap.TreeExplainer(best_model_instance, data=background_sample)
    else:
        # Logistic Regression or SVM
        shap_explainer = shap.KernelExplainer(best_model_instance.predict_proba, background_sample)

    # 5. Export artifacts
    joblib.dump(best_model_instance, os.path.join(ARTIFACTS_DIR, "best_model.joblib"))
    joblib.dump(imputer, os.path.join(ARTIFACTS_DIR, "imputer.joblib"))
    joblib.dump(scaler, os.path.join(ARTIFACTS_DIR, "scaler.joblib"))
    joblib.dump(background_sample, os.path.join(ARTIFACTS_DIR, "shap_background.joblib"))

    metadata = {
        "dataset": "Pima Indians Diabetes Benchmark",
        "total_samples": len(y),
        "positive_class_ratio": round(float(y.mean()), 4),
        "selected_model": best_name,
        "features": feature_names,
        "decision_threshold": 0.45,
        "benchmark_comparison": benchmark_results,
    }

    with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nAll artifacts successfully saved to {ARTIFACTS_DIR}/")
    print("Saved files:")
    print("  - best_model.joblib")
    print("  - imputer.joblib")
    print("  - scaler.joblib")
    print("  - shap_background.joblib")
    print("  - model_metadata.json")


if __name__ == "__main__":
    train_and_export_pipeline()
