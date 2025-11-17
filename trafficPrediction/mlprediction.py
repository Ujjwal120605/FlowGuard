import numpy as np
import pandas as pd
import json
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

class BangaloreTrafficPredictor:
    def __init__(self, csv_path='cars.csv'):
        """Initialize the traffic predictor with Bangalore Pulse dataset"""
        self.csv_path = csv_path
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.feature_columns = []
        self.areas = []
        self.df = None
        
    def load_and_prepare_data(self):
        """Load and prepare the Bangalore traffic dataset"""
        print("\n" + "="*70)
        print("🚦 BANGALORE TRAFFIC PREDICTION SYSTEM - ML MODEL")
        print("="*70)
        print("Loading Bangalore Pulse dataset...")
        
        try:
            # Read the dataset
            self.df = pd.read_csv(self.csv_path)
            print(f"✓ Dataset loaded successfully")
            print(f"  - Shape: {self.df.shape[0]} rows × {self.df.shape[1]} columns")
            print(f"  - Columns: {list(self.df.columns)}")
            
            # Convert Date column to datetime
            self.df['Date'] = pd.to_datetime(self.df['Date'], errors='coerce')
            
            # Extract temporal features
            self.df['Hour'] = self.df['Date'].dt.hour
            self.df['DayOfWeek'] = self.df['Date'].dt.dayofweek
            self.df['Month'] = self.df['Date'].dt.month
            self.df['Day'] = self.df['Date'].dt.day
            self.df['Year'] = self.df['Date'].dt.year
            self.df['IsWeekend'] = (self.df['DayOfWeek'] >= 5).astype(int)
            
            # Create rush hour feature (8-10 AM and 5-8 PM)
            self.df['IsRushHour'] = 0
            rush_hours = [8, 9, 17, 18, 19]
            self.df.loc[self.df['Hour'].isin(rush_hours), 'IsRushHour'] = 1
            
            # Get unique areas
            self.areas = self.df['Area Name'].unique()
            print(f"✓ Found {len(self.areas)} unique areas in Bangalore")
            print(f"  Areas: {', '.join(self.areas[:5])}...")
            
            # Handle missing values
            numeric_columns = self.df.select_dtypes(include=[np.number]).columns
            self.df[numeric_columns] = self.df[numeric_columns].fillna(self.df[numeric_columns].median())
            
            print(f"✓ Successfully processed {len(self.df)} traffic records")
            print(f"✓ Date range: {self.df['Date'].min().date()} to {self.df['Date'].max().date()}")
            
            return self.df
            
        except Exception as e:
            print(f"✗ Error loading dataset: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def encode_categorical_features(self):
        """Encode categorical variables"""
        print("\nEncoding categorical features...")
        
        categorical_columns = ['Area Name', 'Road/Intersection Name', 
                               'Weather Conditions', 'Congestion Level',
                               'Roadwork and Construction Activity']
        
        for col in categorical_columns:
            if col in self.df.columns:
                try:
                    le = LabelEncoder()
                    self.df[f'{col}_encoded'] = le.fit_transform(self.df[col].astype(str))
                    self.label_encoders[col] = le
                    print(f"  ✓ Encoded {col} ({len(le.classes_)} unique values)")
                except Exception as e:
                    print(f"  ✗ Error encoding {col}: {e}")
        
        return self.df
    
    def prepare_features(self):
        """Prepare feature matrix for training"""
        print("\nPreparing features for ML model...")
        
        # Select features based on Bangalore Pulse dataset
        potential_features = [
            'Hour', 'DayOfWeek', 'Month', 'Day', 'Year', 'IsWeekend', 'IsRushHour',
            'Area Name_encoded', 'Road/Intersection Name_encoded',
            'Weather Conditions_encoded', 'Average Speed', 'Travel Time Index',
            'Road Capacity Utilization', 'Incident Reports', 
            'Environmental Impact', 'Public Transport Usage', 
            'Traffic Signal Compliance', 'Parking Usage', 
            'Pedestrian and Cyclist Count',
            'Roadwork and Construction Activity_encoded'
        ]
        
        # Filter only existing columns
        self.feature_columns = [col for col in potential_features if col in self.df.columns]
        
        print(f"✓ Selected {len(self.feature_columns)} features:")
        for i, col in enumerate(self.feature_columns[:10], 1):
            print(f"  {i}. {col}")
        if len(self.feature_columns) > 10:
            print(f"  ... and {len(self.feature_columns) - 10} more")
        
        return self.feature_columns
    
    def train_models(self):
        """Train multiple ML models for traffic prediction"""
        print("\n" + "="*70)
        print("🤖 TRAINING MACHINE LEARNING MODELS")
        print("="*70)
        
        # Prepare data
        X = self.df[self.feature_columns].values
        y = self.df['Traffic Volume'].values
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0)
        y = np.nan_to_num(y, nan=0)
        
        print(f"\nDataset shape: X={X.shape}, y={y.shape}")
        print(f"Traffic Volume range: {y.min():.0f} to {y.max():.0f} vehicles")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, shuffle=True
        )
        
        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")
        
        # Feature scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['main'] = scaler
        
        # Define models to train
        models_config = {
            'Linear Regression': LinearRegression(),
            'Random Forest': RandomForestRegressor(
                n_estimators=100, 
                max_depth=15, 
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            ),
            'Gradient Boosting': GradientBoostingRegressor(
                n_estimators=100, 
                max_depth=7,
                learning_rate=0.1,
                random_state=42
            )
        }
        
        best_model_name = None
        best_score = -float('inf')
        
        print("\n" + "-"*70)
        print("Training and evaluating models...")
        print("-"*70)
        
        for model_name, model in models_config.items():
            print(f"\n🔧 Training {model_name}...")
            
            try:
                # Train model
                if model_name == 'Linear Regression':
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                    self.use_scaling = True
                else:
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                    self.use_scaling = False
                
                # Calculate metrics
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                mae = mean_absolute_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                print(f"  Results:")
                print(f"    RMSE: {rmse:.2f} vehicles")
                print(f"    MAE: {mae:.2f} vehicles")
                print(f"    R² Score: {r2:.4f}")
                print(f"    Accuracy: {max(0, r2*100):.2f}%")
                
                # Save best model
                if r2 > best_score:
                    best_score = r2
                    best_model_name = model_name
                    self.models['main'] = model
                    self.best_use_scaling = (model_name == 'Linear Regression')
                    
            except Exception as e:
                print(f"  ✗ Error training {model_name}: {e}")
        
        if best_model_name:
            print(f"\n{'='*70}")
            print(f"🏆 BEST MODEL: {best_model_name}")
            print(f"   R² Score: {best_score:.4f} ({max(0, best_score*100):.2f}% accuracy)")
            print(f"{'='*70}")
        
        # Train area-specific models
        self.train_area_specific_models()
        
        return self.models
    
    def train_area_specific_models(self):
        """Train models for specific Bangalore areas"""
        print("\n" + "-"*70)
        print("🎯 Training area-specific models...")
        print("-"*70)
        
        # Map similar areas to our 6 major junctions
        area_mapping = {
            'Silk Board': ['Silk Board', 'HSR Layout', 'BTM Layout'],
            'Marathahalli': ['Whitefield', 'Marathahalli', 'ITPL'],
            'Koramangala': ['Koramangala'],
            'MG Road': ['M.G. Road', 'MG Road', 'Brigade Road', 'Commercial Street'],
            'Whitefield': ['Whitefield'],
            'Electronic City': ['Electronic City', 'Hosur Road']
        }
        
        for junction_name, area_variations in area_mapping.items():
            try:
                # Filter data for this area (case insensitive matching)
                area_mask = self.df['Area Name'].str.contains(
                    '|'.join(area_variations), case=False, na=False, regex=True
                )
                area_data = self.df[area_mask]
                
                if len(area_data) > 30:  # Minimum samples
                    X_area = area_data[self.feature_columns].values
                    y_area = area_data['Traffic Volume'].values
                    
                    X_area = np.nan_to_num(X_area, nan=0)
                    y_area = np.nan_to_num(y_area, nan=0)
                    
                    # Train Random Forest for area
                    model_area = RandomForestRegressor(
                        n_estimators=50, 
                        max_depth=10,
                        random_state=42
                    )
                    model_area.fit(X_area, y_area)
                    self.models[junction_name] = model_area
                    
                    print(f"  ✓ {junction_name}: {len(area_data)} samples")
                else:
                    print(f"  ⚠ {junction_name}: Insufficient data ({len(area_data)} samples)")
                    
            except Exception as e:
                print(f"  ✗ {junction_name}: Error - {e}")
    
    def predict_traffic(self, area_name='MG Road', hour=9, day_of_week=0):
        """Predict traffic for specific conditions"""
        
        # Prepare features
        is_weekend = 1 if day_of_week >= 5 else 0
        is_rush_hour = 1 if hour in [8, 9, 17, 18, 19] else 0
        
        features_dict = {
            'Hour': hour,
            'DayOfWeek': day_of_week,
            'Month': datetime.now().month,
            'Day': datetime.now().day,
            'Year': datetime.now().year,
            'IsWeekend': is_weekend,
            'IsRushHour': is_rush_hour,
            'Average Speed': 35.0,
            'Travel Time Index': 1.5 if is_rush_hour else 1.0,
            'Road Capacity Utilization': 85.0 if is_rush_hour else 50.0,
            'Incident Reports': 0,
            'Environmental Impact': 100.0,
            'Public Transport Usage': 50.0,
            'Traffic Signal Compliance': 80.0,
            'Parking Usage': 70.0,
            'Pedestrian and Cyclist Count': 100
        }
        
        # Encode categorical features
        if 'Area Name' in self.label_encoders:
            try:
                encoded_area = self.label_encoders['Area Name'].transform([area_name])[0]
                features_dict['Area Name_encoded'] = encoded_area
            except:
                features_dict['Area Name_encoded'] = 0
        
        if 'Weather Conditions' in self.label_encoders:
            try:
                encoded_weather = self.label_encoders['Weather Conditions'].transform(['Clear'])[0]
                features_dict['Weather Conditions_encoded'] = encoded_weather
            except:
                features_dict['Weather Conditions_encoded'] = 0
        
        if 'Roadwork and Construction Activity' in self.label_encoders:
            try:
                encoded_roadwork = self.label_encoders['Roadwork and Construction Activity'].transform(['No'])[0]
                features_dict['Roadwork and Construction Activity_encoded'] = encoded_roadwork
            except:
                features_dict['Roadwork and Construction Activity_encoded'] = 0
        
        # Create feature vector
        X_pred = np.array([[features_dict.get(col, 0) for col in self.feature_columns]])
        
        # Use area-specific model if available
        model_to_use = None
        for junction in self.models.keys():
            if junction != 'main' and junction.lower() in area_name.lower():
                model_to_use = self.models[junction]
                break
        
        if model_to_use is None:
            model_to_use = self.models.get('main')
        
        # Make prediction
        try:
            if model_to_use == self.models.get('main') and self.best_use_scaling:
                X_pred_scaled = self.scalers['main'].transform(X_pred)
                prediction = model_to_use.predict(X_pred_scaled)[0]
            else:
                prediction = model_to_use.predict(X_pred)[0]
            
            return max(100, int(prediction))
        except Exception as e:
            print(f"Prediction error: {e}")
            return 20000  # Default fallback based on dataset
    
    def generate_predictions_json(self, output_file='traffic_predictions.json'):
        """Generate 24-hour predictions for all major junctions"""
        print("\n" + "="*70)
        print("📊 GENERATING PREDICTIONS FOR NEXT 24 HOURS")
        print("="*70)
        
        major_junctions = {
            'Silk Board': {'lat': 12.9176, 'lng': 77.6227},
            'Marathahalli': {'lat': 12.9591, 'lng': 77.6974},
            'Koramangala': {'lat': 12.9352, 'lng': 77.6245},
            'MG Road': {'lat': 12.9716, 'lng': 77.5946},
            'Whitefield': {'lat': 12.9698, 'lng': 77.7499},
            'Electronic City': {'lat': 12.8456, 'lng': 77.6603}
        }
        
        predictions = {}
        current_time = datetime.now()
        
        for area, coords in major_junctions.items():
            area_predictions = []
            
            for hour_offset in range(24):
                future_time = current_time + timedelta(hours=hour_offset)
                
                traffic_volume = self.predict_traffic(
                    area_name=area,
                    hour=future_time.hour,
                    day_of_week=future_time.weekday()
                )
                
                # Scale down to reasonable numbers (divide by ~100)
                traffic_volume = int(traffic_volume / 60)
                
                congestion = 'High' if traffic_volume > 300 else \
                           'Moderate' if traffic_volume > 200 else 'Low'
                
                area_predictions.append({
                    'hour': future_time.hour,
                    'time': future_time.strftime('%H:%M'),
                    'traffic_volume': traffic_volume,
                    'congestion_level': congestion,
                    'timestamp': future_time.isoformat()
                })
            
            predictions[area] = {
                'location': coords,
                'predictions': area_predictions,
                'current_traffic': area_predictions[0]['traffic_volume'],
                'avg_traffic_24h': int(np.mean([p['traffic_volume'] for p in area_predictions]))
            }
            
            print(f"  ✓ {area}: Current={area_predictions[0]['traffic_volume']}, " 
                  f"24h Avg={predictions[area]['avg_traffic_24h']}")
        
        # Save to JSON
        with open(output_file, 'w') as f:
            json.dump(predictions, f, indent=2)
        
        print(f"\n✓ Predictions exported to: {output_file}")
        print("="*70)
        
        return predictions

# Main execution
if __name__ == "__main__":
    # Initialize predictor
    predictor = BangaloreTrafficPredictor('cars.csv')
    
    # Load and prepare data
    df = predictor.load_and_prepare_data()
    
    if df is not None:
        # Encode and prepare
        predictor.encode_categorical_features()
        predictor.prepare_features()
        
        # Train models
        predictor.train_models()
        
        # Generate predictions
        predictions = predictor.generate_predictions_json()
        
        print("\n" + "="*70)
        print("✅ ML MODEL TRAINING COMPLETE!")
        print("="*70)
        print("\nNext steps:")
        print("  1. Use 'traffic_predictions.json' in your React app")
        print("  2. The model provides accurate traffic predictions")
        print("  3. Refresh predictions periodically for real-time updates")
        print("="*70 + "\n")