from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import shutil
import os
import sys
from typing import List, Optional

# Add parent directory to path to import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from trafficPrediction.mlprediction import EnhancedBangaloreTrafficPredictor
from vehicle_number_by_its_plate.plate_recognition_service import LicensePlateRecognizer

app = FastAPI(
    title="FlowGuard AI API",
    description="Advanced Traffic Management & License Plate Recognition System",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
try:
    # Initialize Traffic Predictor
    # Note: csv_path relative to where main.py is run (usually codebase root)
    traffic_predictor = EnhancedBangaloreTrafficPredictor(csv_path='trafficPrediction/cars.csv', model_dir='models')
    
    # Attempt to load models, if not found, train them
    print("⏳ Initializing Traffic AI...")
    if not traffic_predictor.load_saved_models():
        print("⚠️ No trained models found. Starting initial training (this may take a minute)...")
        traffic_predictor.train()
    else:
        print("✅ Traffic AI Models Loaded Successfully")
        
except Exception as e:
    print(f"❌ Warning: Traffic predictor initialization failed: {e}")
    import traceback
    traceback.print_exc()

try:
    # Initialize with default model (will download if not present)
    plate_recognizer = LicensePlateRecognizer()
except Exception as e:
    print(f"Warning: Plate recognizer initialization failed: {e}")

# Pydantic Models
class TrafficRequest(BaseModel):
    junction_name: str = "Silk Board"

class PredictionResponse(BaseModel):
    hour: int
    time: str
    traffic_volume: int
    congestion_level: str
    timestamp: str

# Endpoints

@app.get("/")
async def root():
    return {"message": "FlowGuard AI System Online", "status": "active"}

# --- Traffic & Detection Endpoints ---

@app.post("/predict/traffic")
async def predict_traffic(request: TrafficRequest):
    """
    Get 24-hour traffic predictions for a specific junction.
    """
    try:
        predictions = traffic_predictor.predict_next_24_hours(request.junction_name)
        return {
            "junction": request.junction_name,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/plate")
async def detect_plate(file: UploadFile = File(...)):
    """
    Detect license plate from an uploaded image.
    """
    try:
        # Save uploaded file temporarily
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process image
        result = plate_recognizer.detect_and_read(temp_file)
        
        # Cleanup
        os.remove(temp_file)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": ["traffic_prediction", "plate_recognition"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
