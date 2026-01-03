import numpy as np
import pandas as pd
import json
import os
import joblib
from datetime import datetime, timedelta
import warnings
# MLflow is optional
try:
    import mlflow
    import mlflow.sklearn
    import mlflow.tensorflow
    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False


warnings.filterwarnings('ignore')

# Deep Learning imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, Model, load_model
    from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, Bidirectional, Attention, Input, concatenate
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    DEEP_LEARNING_AVAILABLE = True
except ImportError:
    print("⚠️  TensorFlow not available. Using traditional ML models.")
    DEEP_LEARNING_AVAILABLE = False

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

class EnhancedBangaloreTrafficPredictor:
    """
    Advanced Traffic Prediction System using Hybrid LSTM-GRU Architecture
    """
    
    def __init__(self, csv_path='cars.csv', model_dir='models'):
        self.csv_path = csv_path
        self.model_dir = model_dir
        self.models = {}
        self.scalers = {}
        self.sequence_length = 24  # Use past 24 hours for prediction
        self.df = None
        self.model_type = 'hybrid_lstm_gru' if DEEP_LEARNING_AVAILABLE else 'ensemble'
        
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
            
        # Initialize MLflow only if available
        if MLFLOW_AVAILABLE:
            try:
                mlflow.set_experiment("FlowGuard_Traffic_Prediction")
            except Exception:
                pass
        
    def load_and_engineer_features(self):
        """Advanced feature engineering for traffic prediction"""
        print("\n" + "="*80)
        print("🚦 FLOWGUARD AI - ENHANCED TRAFFIC PREDICTION SYSTEM")
        print("="*80)
        
        # Robust path resolution
        paths_to_try = [
            self.csv_path,
            os.path.join('trafficPrediction', self.csv_path),
            os.path.join(os.path.dirname(__file__), self.csv_path),
            '/Users/ujjwalbajpai/Desktop/reps/FlowGuard/trafficPrediction/cars.csv'
        ]
        
        final_path = None
        for path in paths_to_try:
            if os.path.exists(path):
                final_path = path
                break
        
        if not final_path:
            print(f"❌ Error: Dataset not found in paths: {paths_to_try}")
            return None
            
        print(f"Loading dataset from: {final_path}")
        
        try:
            self.df = pd.read_csv(final_path)
            print(f"✓ Loaded {len(self.df)} records")
            
            # --- Feature Engineering ---
            # 1. Date/Time Parsing
            if 'Date' in self.df.columns:
                self.df['Date'] = pd.to_datetime(self.df['Date'], errors='coerce')
            else:
                # Synthetic dates as fallback
                start_date = datetime(2022, 1, 1)
                self.df['Date'] = [start_date + timedelta(hours=i) for i in range(len(self.df))]
            
            self.df = self.df.sort_values('Date')
            
            # 2. Extract Temporal Features
            self.df['Hour'] = self.df['Date'].dt.hour
            self.df['DayOfWeek'] = self.df['Date'].dt.dayofweek
            self.df['IsWeekend'] = (self.df['DayOfWeek'] >= 5).astype(int)
            self.df['IsRushHour'] = self.df['Hour'].isin([8, 9, 10, 17, 18, 19]).astype(int)
            
            # 3. Cyclical Encoding
            self.df['Hour_sin'] = np.sin(2 * np.pi * self.df['Hour'] / 24)
            self.df['Hour_cos'] = np.cos(2 * np.pi * self.df['Hour'] / 24)
            self.df['Day_sin'] = np.sin(2 * np.pi * self.df['DayOfWeek'] / 7)
            self.df['Day_cos'] = np.cos(2 * np.pi * self.df['DayOfWeek'] / 7)
            
            # 4. Target Variable Resolution
            if 'Traffic Volume' in self.df.columns:
                self.df['TrafficVolume'] = self.df['Traffic Volume']
            elif 'TotalCars' in self.df.columns:
                self.df['TrafficVolume'] = self.df['TotalCars']
            else:
                # Try summing lanes if available
                lane_cols = [c for c in self.df.columns if 'Lane' in c]
                if lane_cols:
                    self.df['TrafficVolume'] = self.df[lane_cols].sum(axis=1)
                else:
                    # Final fallback: synthetic
                    print("⚠️ target column missing, using synthetic volume")
                    self.df['TrafficVolume'] = np.random.randint(50, 500, size=len(self.df))

            # 5. Lag Features (Critical for Time Series)
            self.df['Traffic_Lag1'] = self.df['TrafficVolume'].shift(1)
            self.df['Traffic_Lag24'] = self.df['TrafficVolume'].shift(24) # Same time yesterday
            self.df['Traffic_MA3'] = self.df['TrafficVolume'].rolling(window=3).mean()
            
            self.df = self.df.dropna() # Drop rows with NaNs from shifting
            
            return self.df
            
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            import traceback
            traceback.print_exc()
            return None

    def prepare_data(self):
        """Prepare X and y matrices"""
        feature_cols = [
            'Hour_sin', 'Hour_cos', 'Day_sin', 'Day_cos', 
            'IsWeekend', 'IsRushHour',
            'Traffic_Lag1', 'Traffic_Lag24', 'Traffic_MA3'
        ]
        
        X = self.df[feature_cols].values
        y = self.df['TrafficVolume'].values
        
        # Scaling
        self.scalers['X'] = StandardScaler()
        self.scalers['y'] = StandardScaler() # Useful for DL output
        
        X_scaled = self.scalers['X'].fit_transform(X)
        y_scaled = self.scalers['y'].fit_transform(y.reshape(-1, 1)).flatten()
        
        # Save scalers for inference
        joblib.dump(self.scalers['X'], os.path.join(self.model_dir, 'scaler_X.save'))
        joblib.dump(self.scalers['y'], os.path.join(self.model_dir, 'scaler_y.save'))
        
        return X_scaled, y_scaled, X, y

    def train(self):
        """Train models and save them"""
        if self.load_and_engineer_features() is None:
            return False
            
        X_scaled, y_scaled, X_raw, y_raw = self.prepare_data()
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_scaled, test_size=0.2, shuffle=False)
        
        print("\n🚀 Training Random Forest Model (Baseline)...")
        rf_model = RandomForestRegressor(n_estimators=100, max_depth=15, n_jobs=-1, random_state=42)
        rf_model.fit(X_train, y_train)
        
        y_pred_rf = rf_model.predict(X_test)
        r2_rf = r2_score(y_test, y_pred_rf)
        print(f"✅ Random Forest R²: {r2_rf:.4f}")
        
        # Save RF model
        joblib.dump(rf_model, os.path.join(self.model_dir, 'rf_model.joblib'))
        self.models['rf'] = rf_model
        
        if DEEP_LEARNING_AVAILABLE:
            print("\n🚀 Training Deep Learning Model (LSTM-GRU)...")
            # Reshape for RNN [samples, time steps, features]
            # Here we use sequence length of 1 for simplicity in this implementation update, 
            # ideally would use sliding window generator for seq_len > 1
            X_train_dl = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
            X_test_dl = X_test.reshape((X_test.shape[0], 1, X_test.shape[1]))
            
            inputs = Input(shape=(1, X_train.shape[1]))
            x = LSTM(64, return_sequences=True)(inputs)
            x = Dropout(0.2)(x)
            x = GRU(32)(x)
            outputs = Dense(1)(x)
            
            dl_model = Model(inputs, outputs)
            dl_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
            
            dl_model.fit(X_train_dl, y_train, epochs=20, batch_size=32, validation_split=0.2, verbose=1)
            
            y_pred_dl = dl_model.predict(X_test_dl)
            r2_dl = r2_score(y_test, y_pred_dl)
            print(f"✅ Deep Learning R²: {r2_dl:.4f}")
            
            # Save DL model
            dl_model.save(os.path.join(self.model_dir, 'dl_model.h5'))
            self.models['dl'] = dl_model
            
        print("\n💾 Models saved successfully.")
        return True

    def load_saved_models(self):
        """Load pretrained models"""
        try:
            self.models['rf'] = joblib.load(os.path.join(self.model_dir, 'rf_model.joblib'))
            self.scalers['X'] = joblib.load(os.path.join(self.model_dir, 'scaler_X.save'))
            self.scalers['y'] = joblib.load(os.path.join(self.model_dir, 'scaler_y.save'))
            
            if DEEP_LEARNING_AVAILABLE and os.path.exists(os.path.join(self.model_dir, 'dl_model.h5')):
                self.models['dl'] = load_model(os.path.join(self.model_dir, 'dl_model.h5'))
                
            return True
        except Exception as e:
            print(f"Warning: Could not load saved models: {e}")
            return False

    def predict_next_24_hours(self, junction_name='Silk Board'):
        """
        Generate 24h predictions using the TRAINED model.
        """
        # Ensure models are loaded
        if not self.models and not self.load_saved_models():
            print("⚠️ No models found. Training now...")
            if not self.train():
                return self._heuristic_fallback(junction_name)

        predictions = []
        current_time = datetime.now()
        
        # Prepare feature vector for next 24 hours
        # We need to constructing synthetic features for future timestamps
        # Note: Lags are tricky for future without autoregression. 
        # We will use the last known "Traffic_MA3" as a baseline for lags.
        
        try:
            # Base features
            feature_list = []
            
            # Use last known traffic average from valid data if possible, else 200
            last_traffic = 200 
            
            for i in range(24):
                future_time = current_time + timedelta(hours=i)
                hour = future_time.hour
                day = future_time.weekday()
                
                # Construct features in same order as training
                # 'Hour_sin', 'Hour_cos', 'Day_sin', 'Day_cos', 'IsWeekend', 'IsRushHour', 'Traffic_Lag1', ...
                
                features = [
                    np.sin(2 * np.pi * hour / 24),
                    np.cos(2 * np.pi * hour / 24),
                    np.sin(2 * np.pi * day / 7),
                    np.cos(2 * np.pi * day / 7),
                    1 if day >= 5 else 0,
                    1 if hour in [8,9,10,17,18,19] else 0,
                    last_traffic, # Lag1 (Approx)
                    last_traffic, # Lag24 (Approx)
                    last_traffic  # MA3 (Approx)
                ]
                feature_list.append(features)
            
            X_future = np.array(feature_list)
            X_future_scaled = self.scalers['X'].transform(X_future)
            
            # Predict
            model = self.models.get('dl', self.models.get('rf'))
            if DEEP_LEARNING_AVAILABLE and 'dl' in self.models:
                X_future_scaled = X_future_scaled.reshape((X_future_scaled.shape[0], 1, X_future_scaled.shape[1]))
                
            y_pred_scaled = model.predict(X_future_scaled)
            
            if DEEP_LEARNING_AVAILABLE and 'dl' in self.models:
                 y_pred = self.scalers['y'].inverse_transform(y_pred_scaled).flatten()
            else:
                 y_pred = self.scalers['y'].inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()

            # Format Output
            for i, vol in enumerate(y_pred):
                future_time = current_time + timedelta(hours=i)
                vol = max(50, int(vol)) # Relu
                
                # Junction specific multiplier (simple calibration)
                junction_multipliers = {
                    'Silk Board': 1.2, 'Marathahalli': 1.1, 'Koramangala': 1.0,
                    'MG Road': 1.15, 'Whitefield': 1.05, 'Electronic City': 0.95,
                    'Pattanegre': 1.05
                }
                vol = int(vol * junction_multipliers.get(junction_name, 1.0))
                
                predictions.append({
                    'hour': future_time.hour,
                    'time': future_time.strftime('%H:%M'),
                    'traffic_volume': vol,
                    'congestion_level': 'High' if vol > 350 else 'Moderate' if vol > 200 else 'Low',
                    'timestamp': future_time.isoformat()
                })
                
            return predictions
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return self._heuristic_fallback(junction_name)

    def _heuristic_fallback(self, junction_name):
        print("⚠️ Using heuristic fallback")
        predictions = []
        current_time = datetime.now()
        base_traffic = 300
        
        for i in range(24):
            future_time = current_time + timedelta(hours=i)
            is_rush = future_time.hour in [8,9,10,17,18,19]
            vol = base_traffic * (1.5 if is_rush else 0.8)
            predictions.append({
                'hour': future_time.hour,
                'time': future_time.strftime('%H:%M'),
                'traffic_volume': int(vol),
                'congestion_level': 'High' if vol > 350 else 'Moderate',
                'timestamp': future_time.isoformat()
            })
        return predictions

if __name__ == "__main__":
    predictor = EnhancedBangaloreTrafficPredictor()
    predictor.train()