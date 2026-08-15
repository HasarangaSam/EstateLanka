import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from pathlib import Path

from huggingface_hub import hf_hub_download

import joblib
import pandas as pd


app = FastAPI(
    title="EstateLanka House Price Prediction API",
    description="API for predicting Sri Lankan house prices",
    version="1.0.0"
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Model configuration
# --------------------------------

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "model"

MODEL_PATH = MODEL_DIR / "house_price_model.pkl"

HF_REPO_ID = "HasaruSam/estatelanka-house-price-model"

MODEL_FILENAME = "house_price_model.pkl"


# --------------------------------
# Load model
# --------------------------------

if not MODEL_PATH.exists():

    print("Local model not found.")
    print("Downloading model from Hugging Face...")

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    downloaded_model = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=MODEL_FILENAME,
        local_dir=MODEL_DIR
    )

    print(
        f"Model downloaded to: {downloaded_model}"
    )


model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")


# --------------------------------
# Input model
# --------------------------------

class PropertyInput(BaseModel):

    district: str

    area: str

    perch: int

    bedrooms: int

    bathrooms: int

    kitchen_area_sqft: int

    parking_spots: int

    has_garden: bool

    has_ac: bool

    water_supply: str

    electricity: str

    floors: int

    year_built: int


# --------------------------------
# Routes
# --------------------------------

@app.get("/")
def home():

    return {
        "message": "EstateLanka House Price Prediction API is running"
    }


@app.post("/predict")
def predict_price(
    property_data: PropertyInput
):

    try:

        input_data = pd.DataFrame(
            [property_data.model_dump()]
        )

        prediction = model.predict(
            input_data
        )

        predicted_price = prediction[0]

        return {
            "success": True,
            "predicted_price_lkr": round(
                float(predicted_price),
                2
            )
        }

    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate house price prediction"
        )