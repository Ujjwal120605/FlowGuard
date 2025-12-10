import pytest
from fastapi.testclient import TestClient
import sys
import os
import pandas as pd
import numpy as np

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from trafficPrediction.mlprediction import EnhancedBangaloreTrafficPredictor

client = TestClient(app)

class TestTrafficPredictor:
    @pytest.fixture
    def predictor(self):
        # Create a dummy csv for testing
        df = pd.DataFrame({
            'Date': pd.date_range(start='2023-01-01', periods=100, freq='H'),
            'TotalCars': np.random.randint(100, 500, 100)
        })
        df.to_csv('test_cars.csv', index=False)
        yield EnhancedBangaloreTrafficPredictor(csv_path='test_cars.csv')
        # Cleanup
        if os.path.exists('test_cars.csv'):
            os.remove('test_cars.csv')

    def test_feature_engineering(self, predictor):
        """Test if features are generated correctly"""
        df = predictor.load_and_engineer_features()
        assert df is not None
        assert 'Hour_sin' in df.columns
        assert 'TrafficVolume_MA3' in df.columns
        assert 'IsRushHourMorning' in df.columns

    def test_prediction_shape(self, predictor):
        """Test prediction output format"""
        predictions = predictor.predict_next_24_hours('Silk Board')
        assert len(predictions) == 24
        assert 'traffic_volume' in predictions[0]
        assert 'congestion_level' in predictions[0]

class TestAPI:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "active"

    def test_traffic_prediction_endpoint(self):
        response = client.post("/predict/traffic", json={"junction_name": "Silk Board"})
        assert response.status_code == 200
        data = response.json()
        assert data["junction"] == "Silk Board"
        assert len(data["predictions"]) == 24

    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert "traffic_prediction" in response.json()["services"]
