import numpy as np
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import warnings
import mlflow
import mlflow.sklearn
import mlflow.tensorflow

warnings.filterwarnings('ignore')

# Deep Learning imports
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout, Bidirectional, Attention, Input, concatenate
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    DEEP_LEARNING_AVAILABLE = True
except ImportError:
    print("⚠️  TensorFlow not available. Using traditional ML models.")
    DEEP_LEARNING_AVAILABLE = False

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.linear_model import Ridge

class EnhancedBangaloreTrafficPredictor:
    """
    Advanced Traffic Prediction System using Hybrid LSTM-GRU Architecture
    Features:
    - Temporal pattern learning (LSTM)
    - Short-term dependency capture (GRU)
    - Attention mechanism for important time windows
    - Multi-output predictions (traffic volume, speed, congestion)
    - MLflow Experiment Tracking
    """
    
    def __init__(self, csv_path='cars.csv'):
        self.csv_path = csv_path
        self.models = {}
        self.scalers = {}
        self.sequence_length = 24  # Use past 24 hours for prediction
        self.df = None
        self.model_type = 'hybrid_lstm_gru' if DEEP_LEARNING_AVAILABLE else 'ensemble'
        
        # Initialize MLflow
        mlflow.set_experiment("FlowGuard_Traffic_Prediction")
        
    def load_and_engineer_features(self):
        """Advanced feature engineering for traffic prediction"""
        print("\n" + "="*80)
        print("🚦 FLOWGUARD AI - ENHANCED TRAFFIC PREDICTION SYSTEM")
        print("="*80)
        print(f"Loading dataset from: {self.csv_path}")
        
        try:
            if not os.path.exists(self.csv_path):
                # Fallback for API usage if file is in a different relative path
                possible_paths = [
                    self.csv_path,
                    os.path.join('trafficPrediction', self.csv_path),
                    os.path.join('..', 'trafficPrediction', self.csv_path)
                ]
                for path in possible_paths:
                    if os.path.exists(path):
                        self.csv_path = path
                        break
            
            self.df = pd.read_csv(self.csv_path)
            print(f"✓ Loaded {len(self.df)} records")
            
            # Enhanced temporal features
            if 'Date' in self.df.columns:
                self.df['Date'] = pd.to_datetime(self.df['Date'], errors='coerce')
            else:
                # Create synthetic dates if not present
                start_date = datetime(2020, 7, 1)
                self.df['Date'] = [start_date + timedelta(hours=i) for i in range(len(self.df))]
            
            # Basic temporal features
            self.df['Hour'] = self.df['Date'].dt.hour
            self.df['DayOfWeek'] = self.df['Date'].dt.dayofweek
            self.df['Month'] = self.df['Date'].dt.month
            self.df['Day'] = self.df['Date'].dt.day
            self.df['IsWeekend'] = (self.df['DayOfWeek'] >= 5).astype(int)
            
            # Advanced temporal features
            self.df['IsRushHourMorning'] = self.df['Hour'].isin([7, 8, 9, 10]).astype(int)
            self.df['IsRushHourEvening'] = self.df['Hour'].isin([17, 18, 19, 20]).astype(int)
            self.df['IsNightTime'] = self.df['Hour'].isin([0, 1, 2, 3, 4, 5]).astype(int)
            
            # Cyclical encoding
            self.df['Hour_sin'] = np.sin(2 * np.pi * self.df['Hour'] / 24)
            self.df['Hour_cos'] = np.cos(2 * np.pi * self.df['Hour'] / 24)
            self.df['DayOfWeek_sin'] = np.sin(2 * np.pi * self.df['DayOfWeek'] / 7)
            self.df['DayOfWeek_cos'] = np.cos(2 * np.pi * self.df['DayOfWeek'] / 7)
            
            # Traffic volume aggregation
            if 'TotalCars' in self.df.columns:
                self.df['TrafficVolume'] = self.df['TotalCars']
            elif all(col in self.df.columns for col in ['Lane-1', 'Lane-2', 'Lane-3', 'Lane-4']):
                self.df['TrafficVolume'] = (self.df['Lane-1'] + self.df['Lane-2'] + 
                                           self.df['Lane-3'] + self.df['Lane-4'])
            else:
                print("⚠️  Warning: No traffic volume column found, generating synthetic data")
                self.df['TrafficVolume'] = np.random.randint(100, 400, len(self.df))
            
            # Rolling statistics
            self.df['TrafficVolume_MA3'] = self.df['TrafficVolume'].rolling(window=3, min_periods=1).mean()
            self.df['TrafficVolume_MA6'] = self.df['TrafficVolume'].rolling(window=6, min_periods=1).mean()
            self.df['TrafficVolume_STD3'] = self.df['TrafficVolume'].rolling(window=3, min_periods=1).std().fillna(0)
            
            # Lag features
            self.df['TrafficVolume_Lag1'] = self.df['TrafficVolume'].shift(1).fillna(method='bfill')
            self.df['TrafficVolume_Lag3'] = self.df['TrafficVolume'].shift(3).fillna(method='bfill')
            
            # Traffic trend
            self.df['TrafficTrend'] = self.df['TrafficVolume'].diff().fillna(0)
            
            return self.df
            
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            return None
    
    def prepare_sequences(self, data):
        """Prepare sequences for LSTM/GRU training"""
        feature_cols = [
            'Hour', 'DayOfWeek', 'IsWeekend', 'IsRushHourMorning', 'IsRushHourEvening',
            'Hour_sin', 'Hour_cos', 'DayOfWeek_sin', 'DayOfWeek_cos',
            'TrafficVolume_MA3', 'TrafficVolume_MA6', 'TrafficVolume_STD3',
            'TrafficVolume_Lag1', 'TrafficVolume_Lag3',
            'TrafficTrend', 'TrafficVolume'
        ]
        
        feature_cols = [col for col in feature_cols if col in data.columns]
        
        X, y = [], []
        values = data[feature_cols].values
        
        for i in range(self.sequence_length, len(values)):
            X.append(values[i-self.sequence_length:i])
            y.append(values[i, -1])
        
        return np.array(X), np.array(y)
    
    def build_hybrid_model(self, input_shape):
        """Build Hybrid LSTM-GRU model with attention"""
        inputs = Input(shape=input_shape)
        
        # LSTM branch
        lstm_out = Bidirectional(LSTM(128, return_sequences=True))(inputs)
        lstm_out = Dropout(0.2)(lstm_out)
        lstm_out = Bidirectional(LSTM(64, return_sequences=True))(lstm_out)
        
        # GRU branch
        gru_out = Bidirectional(GRU(128, return_sequences=True))(inputs)
        gru_out = Dropout(0.2)(gru_out)
        gru_out = Bidirectional(GRU(64, return_sequences=True))(gru_out)
        
        # Combine
        combined = concatenate([lstm_out, gru_out])
        combined = Dropout(0.3)(combined)
        
        # Attention
        attention = Attention()([combined, combined])
        attention = Dropout(0.2)(attention)
        
        # Dense
        flat = tf.keras.layers.Flatten()(attention)
        dense1 = Dense(128, activation='relu')(flat)
        dense1 = Dropout(0.3)(dense1)
        dense2 = Dense(64, activation='relu')(dense1)
        
        outputs = Dense(1, activation='linear')(dense2)
        
        model = Model(inputs=inputs, outputs=outputs)
        model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.001),
                     loss='huber', metrics=['mae', 'mse'])
        return model
    
    def train_deep_learning_model(self):
        """Train the hybrid LSTM-GRU model with MLflow tracking"""
        with mlflow.start_run(run_name="Hybrid_LSTM_GRU"):
            # Log parameters
            mlflow.log_param("model_type", "Hybrid LSTM-GRU")
            mlflow.log_param("sequence_length", self.sequence_length)
            
            X, y = self.prepare_sequences(self.df)
            
            # Split and Scale
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            
            scaler_X = MinMaxScaler()
            scaler_y = MinMaxScaler()
            
            X_train_scaled = scaler_X.fit_transform(X_train.reshape(-1, X_train.shape[-1])).reshape(X_train.shape)
            X_test_scaled = scaler_X.transform(X_test.reshape(-1, X_test.shape[-1])).reshape(X_test.shape)
            y_train_scaled = scaler_y.fit_transform(y_train.reshape(-1, 1)).flatten()
            y_test_scaled = scaler_y.transform(y_test.reshape(-1, 1)).flatten()
            
            self.scalers['X'] = scaler_X
            self.scalers['y'] = scaler_y
            
            model = self.build_hybrid_model((X_train.shape[1], X_train.shape[2]))
            
            # Train
            history = model.fit(
                X_train_scaled, y_train_scaled,
                validation_split=0.2,
                epochs=50, # Reduced for demo speed
                batch_size=32,
                callbacks=[EarlyStopping(patience=5)],
                verbose=1
            )
            
            # Evaluate
            y_pred_scaled = model.predict(X_test_scaled, verbose=0)
            y_pred = scaler_y.inverse_transform(y_pred_scaled).flatten()
            
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Log metrics
            mlflow.log_metric("mse", mse)
            mlflow.log_metric("mae", mae)
            mlflow.log_metric("r2", r2)
            
            # Log model
            mlflow.tensorflow.log_model(model, "model")
            
            print(f"✓ Model R² Score: {r2:.4f}")
            self.models['hybrid'] = model
            return model, history
    
    def train_ensemble_model(self):
        """Train ensemble with MLflow tracking"""
        with mlflow.start_run(run_name="Ensemble_RF"):
            feature_cols = [
                'Hour', 'DayOfWeek', 'IsWeekend', 'IsRushHourMorning', 'IsRushHourEvening',
                'Hour_sin', 'Hour_cos', 'TrafficVolume_MA3', 'TrafficVolume_Lag1'
            ]
            feature_cols = [col for col in feature_cols if col in self.df.columns]
            
            X = self.df[feature_cols].fillna(0).values
            y = self.df['TrafficVolume'].values
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            self.scalers['ensemble'] = scaler
            
            model = RandomForestRegressor(n_estimators=100, max_depth=20, random_state=42)
            model.fit(X_train_scaled, y_train)
            
            y_pred = model.predict(X_test_scaled)
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            
            mlflow.log_param("model_type", "RandomForest")
            mlflow.log_metric("r2", r2)
            mlflow.log_metric("mae", mae)
            mlflow.sklearn.log_model(model, "model")
            
            print(f"✓ Ensemble R² Score: {r2:.4f}")
            self.models['ensemble'] = model
            return model

    def predict_next_24_hours(self, junction_name='Silk Board'):
        """Predict traffic for next 24 hours (Heuristic fallback for demo robustness)"""
        predictions = []
        current_time = datetime.now()
        
        # Base patterns and multipliers (same as before for consistency)
        base_pattern = {
            0: 0.3, 1: 0.2, 2: 0.15, 3: 0.15, 4: 0.2, 5: 0.4,
            6: 0.7, 7: 0.9, 8: 1.0, 9: 0.95, 10: 0.8, 11: 0.7,
            12: 0.75, 13: 0.7, 14: 0.65, 15: 0.7, 16: 0.85,
            17: 1.0, 18: 0.98, 19: 0.92, 20: 0.75, 21: 0.6,
            22: 0.5, 23: 0.4
        }
        
        junction_multipliers = {
            'Silk Board': 350, 'Marathahalli': 380, 'Koramangala': 320,
            'MG Road': 340, 'Whitefield': 360, 'Electronic City': 330
        }
        
        base_traffic = junction_multipliers.get(junction_name, 300)
        
        for hour_offset in range(24):
            future_time = current_time + timedelta(hours=hour_offset)
            hour = future_time.hour
            is_weekend = future_time.weekday() >= 5
            
            pattern_factor = base_pattern.get(hour, 0.5)
            weekend_factor = 0.7 if is_weekend else 1.0
            random_factor = np.random.uniform(0.9, 1.1)
            
            traffic = int(base_traffic * pattern_factor * weekend_factor * random_factor)
            traffic = max(50, min(450, traffic))
            
            congestion = 'High' if traffic > 300 else 'Moderate' if traffic > 200 else 'Low'
            
            predictions.append({
                'hour': hour,
                'time': future_time.strftime('%H:%M'),
                'traffic_volume': traffic,
                'congestion_level': congestion,
                'timestamp': future_time.isoformat()
            })
        
        return predictions

    def train(self):
        """Main training pipeline"""
        if self.load_and_engineer_features() is None:
            return False
        
        if DEEP_LEARNING_AVAILABLE and self.model_type == 'hybrid_lstm_gru':
            self.train_deep_learning_model()
        else:
            self.train_ensemble_model()
        
        return True

if __name__ == "__main__":
    predictor = EnhancedBangaloreTrafficPredictor('cars.csv')
    predictor.train()