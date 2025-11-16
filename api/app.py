from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "heart_rf_pipeline.pkl")
model = joblib.load(MODEL_PATH)

app = FastAPI(title="Heart Disease Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Patient(BaseModel):
    age: float
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

@app.post("/predict")
def predict(patient: Patient):
    data = pd.DataFrame([{
        "age": patient.age,
        "sex": patient.sex,
        "cp": patient.cp,
        "trestbps": patient.trestbps,
        "chol": patient.chol,
        "fbs": patient.fbs,
        "restecg": patient.restecg,
        "thalach": patient.thalach,
        "exang": patient.exang,
        "oldpeak": patient.oldpeak,
        "slope": patient.slope,
        "ca": patient.ca,
        "thal": patient.thal
    }])

    prob = float(model.predict_proba(data)[:, 1][0])  
    label = int(model.predict(data)[0])

    return {
        "probability": prob,
        "label": label
    }
