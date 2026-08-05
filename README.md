# 🚦 FlowGuard AI

<div align="center">

![FlowGuard AI Banner](https://img.shields.io/badge/FlowGuard_AI-Traffic_Intelligence-blueviolet?style=for-the-badge&logo=smart&logoColor=white)

### 🤖 AI-Powered Traffic Management System for Bangalore

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-success?style=for-the-badge)](https://flow-guard-ecru.vercel.app/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![ML Powered](https://img.shields.io/badge/ML-Powered-orange?style=for-the-badge&logo=tensorflow&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**[🚀 Live Demo](https://flow-guard-ecru.vercel.app/) • [📖 Documentation](#-features) • [🎥 Video Demo](#-demo)**

---

*Revolutionizing Bangalore's traffic with machine learning, real-time monitoring, and intelligent signal control*

</div>

---

## 🌟 What is FlowGuard AI?

FlowGuard AI is a next-generation **intelligent traffic management system** designed to tackle Bangalore's notorious traffic congestion. By leveraging **machine learning algorithms** trained on the **Bangalore Pulse Dataset**, FlowGuard AI provides real-time traffic predictions, dynamic signal control, and comprehensive vehicle management—all in one powerful platform.

### 💡 The Problem We Solve

Bangalore faces some of India's worst traffic congestion, costing millions of hours in productivity and increasing pollution. FlowGuard AI addresses this by:

- 🎯 **Predicting traffic** up to 24 hours in advance.
- ⚡ **Optimizing traffic signals** dynamically based on real-time density.
- 🚗 **Visualizing live traffic** with animated car markers.
- 📊 **Analyzing patterns** to identify congestion hotspots.
- 🚨 **Managing violations** with automated fine processing.
- 🏥 **Green Corridors** to prioritize emergency vehicles (ambulances) in real-time.

---

## 🏗️ Project Architecture

FlowGuard AI is built as a distributed, service-oriented system comprising a single-page React frontend, a Node.js Express coordination layer, and a Python FastAPI ML microservice.

```
       ┌───────────────────────────────────────────────────┐
       │                 React Frontend                    │
       │                   (Port 3000)                     │
       └────────────────────────┬──────────────────────────┘
                                │
                        /api/* (Proxied)
                                │
                                ▼
       ┌───────────────────────────────────────────────────┐
       │             Node.js Express Backend               │
       │                   (Port 8000)                     │
       └───────────────┬─────────────────────────┬─────────┘
                       │                         │
            MongoDB Queries                      │ Proxy requests
                       │                         │
                       ▼                         ▼
  ┌─────────────────────────┐       ┌──────────────────────────┐
  │      MongoDB Server     │       │   Python FastAPI Server  │
  │ (Atlas or In-Memory Dev)│       │        (Port 8001)       │
  └─────────────────────────┘       └────────────┬─────────────┘
                                                 │
                                     ┌───────────┴───────────┐
                                     ▼                       ▼
                            ┌─────────────────┐     ┌─────────────────┐
                            │    Traffic AI   │     │    YOLO + OCR   │
                            │   (RandomForest)│     │   (Plate Recog) │
                            └─────────────────┘     └─────────────────┘
```

1. **Frontend (React 18)**: Offers the interactive UI, dynamic SVG maps with animated vehicle routes, analytics panels, and dashboard configurations.
2. **Node.js Express Orchestrator**: Handles user authentication, vehicle CRUD, violation persistence, and acts as a security and rate-limiting proxy to the FastAPI backend.
3. **Python FastAPI Backend**: Hosts the memory-intensive ML tasks. It executes Random Forest predictions and processes computer vision tasks (YOLOv8 + EasyOCR) for reading license plates.

---

## ✨ Features Breakdown

### 1. Live Traffic Monitor & Map
* Watch Bangalore's traffic come alive on an interactive dashboard with custom color-coded traffic lights and density indicators.
* Coverage includes 6 major Bangalore junctions:
  * **Silk Board Junction** (Hosur Road & Outer Ring Road)
  * **Marathahalli Junction** (IT Corridor Hub)
  * **Koramangala Junction** (80 Feet Road)
  * **MG Road Junction** (City Center)
  * **Whitefield Junction** (ITPL Main Road)
  * **Electronic City Junction** (Hosur Road IT Hub)
* Animated car markers match live junction calculations (1 marker represents 5 vehicles).

### 2. Machine Learning Predictions
* Utilizes a Random Forest model trained on the Bangalore Pulse Traffic Dataset.
* Predicts traffic volumes up to 24 hours ahead, updating every 5 minutes based on historical volume, peak hour tags, rush hour indicators, and day-of-week variables.
* Yields an average $R^2$ accuracy score of ~87%.

### 3. Smart Vehicle Registry & Plate Recognition
* Registers vehicle types (two-wheeler, four-wheeler, commercial, heavy), chassis/engine numbers, registration numbers, owner information, and current violation state.
* Utilizes **YOLOv8** to locate vehicles and license plates in uploaded photos, followed by **EasyOCR** processing (with adaptive thresholding and denoising) to read the alphanumeric code.

### 4. Emergency Green Corridor (Ambulance Tracking)
* Allows city operators to track emergency vehicles on a live route map.
* Dynamically overrides junction traffic signals ahead of the ambulance to generate a "Green Corridor", reducing response times by up to 50%.

### 5. Automated Violation Management
* Processes fines for offences like red-light jumps, wrong-way driving, over-speeding, and parking violations.
* Links violations to specific vehicle registration plates and records historical logs in the database.

---

## ⚡ Developer & Local Runtime Optimizations

To ensure the codebase runs robustly without heavy configuration or external dependencies, we implemented several features:

### 🔄 Automatic MongoDB Memory Fallback
If the Express backend fails to connect to the cloud MongoDB URL (due to authentication errors, timeouts, or `ENOTFOUND` dns resolutions), it **automatically falls back to a locally spun up MongoDB database** via `mongodb-memory-server`. This downloads and starts an in-memory database instance automatically, allowing the app to run locally without a MongoDB database setup.

### ⚡ Lazy Loading Plate Recognition Models
Loading deep learning weights (YOLOv8) and downloading OCR models (EasyOCR) during application initialization can block Uvicorn from starting up. We refactored `LicensePlateRecognizer` to **lazy load** all models. The backend server starts instantly in under 2 seconds, and the models are initialized on demand when the first plate recognition request is dispatched.

---

## 🔌 API Reference

### Express API Gateway (Port 8000)

* `GET /api/health` - Performs a quick check to see if database connections (cloud or local fallback) are active.
* `POST /api/vehicles/register` - Registers a new vehicle with owner details.
* `GET /api/vehicles` - Fetches all registered vehicles.
* `GET /api/vehicles/:vehicleNumber` - Retrieves details of a single vehicle.
* `PUT /api/vehicles/:vehicleNumber/status` - Marks a vehicle as missing/active.
* `POST /api/vehicles/:vehicleNumber/fine` - Appends a fine event to a vehicle's history.
* `POST /api/predict/traffic` - Proxies traffic forecasting requests to the FastAPI backend.
* `POST /api/detect/plate` - Proxies plate recognition requests containing image uploads to the FastAPI backend.

### FastAPI AI Backend (Port 8001)

* `GET /` - Root confirmation.
* `GET /health` - Checks ML services availability status.
* `POST /predict/traffic` - Computes a 24-hour traffic volume forecast for a specified junction.
* `POST /detect/plate` - Accepts a file upload (`UploadFile`), performs YOLOv8 plate detection, runs EasyOCR extraction, and returns the license plate text.

---

## ⚖️ Custom Violation Catalog & Fines

Our automated violation processing tracks and manages outstanding fines linked to registered vehicle records:

| Violation Code | Description | Penalty | Detection Pipeline |
|---|---|---|---|
| **RED_LIGHT_JUMP** | Disobeying junction signals | ₹1,000 | Speed cameras + Signal sensors |
| **OVERSPEEDING** | Exceeding limit (over 60km/h) | ₹1,000 | Radar speed tracking detectors |
| **WRONG_WAY** | Driving against flow of traffic | ₹500 | Video surveillance frame processing |
| **ILLEGAL_PARKING** | Parking in restricted/towing zones | ₹200 | CCTV image alerts & updates |
| **MOBILE_DRIVING** | Distracted driving behavior | ₹1,000 | In-cabin AI camera feeds |
| **NO_LICENSE** | No valid registration records | ₹5,000 | RTO database lookup matching |

---

## 🎮 Setup & Run Guide

### 📋 Prerequisites
* **Python** 3.9+ installed.
* **Node.js** (or use the pre-packaged Node bundle located in `node_bin/bin`).

### 1. Backend Package Installations
Open your terminal and install dependencies for the backends:

```bash
# Install Node.js backend packages
PATH="./node_bin/bin:$PATH" npm install --prefix backend

# Activate virtualenv and install python packages
./venv/bin/pip install python-multipart
```

### 2. Environment Variables
Verify your `.env` file at the root contains the necessary configuration keys:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_OPENROUTE_API_KEY=your_routing_key
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/flowguard_db
```
*Note: If `MONGODB_URL` is omitted or fails to connect, the server automatically starts an in-memory database.*

### 3. Launching Services
Run the three servers concurrently in separate terminals or in the background:

#### Terminal A: Python FastAPI Backend (Port 8001)
```bash
# PYTHONUNBUFFERED disables buffering to log stdout outputs immediately
PYTHONUNBUFFERED=1 ./venv/bin/python backend/main.py
```

#### Terminal B: Node.js Express Backend (Port 8000)
```bash
# Prepend local node binaries to system path
PATH="./node_bin/bin:$PATH" node backend/server.js
```

#### Terminal C: React Frontend (Port 3000)
```bash
# BROWSER=none prevents opening browser windows automatically in container hosts
BROWSER=none PATH="./node_bin/bin:$PATH" npm start
```

---

## 📈 ML Model Performance

Our ML engine maps peak hours, weekend factors, and junction IDs:

| Metric | Value | Description |
|--------|-------|-------------|
| **Accuracy** | 87.3% | Core prediction capability on test metrics |
| **MAE** | 12.4 vehicles | Mean Absolute Error average |
| **Inference Time** | <50ms | Real-time response speed per prediction request |

```javascript
// Calculate optimal green time for each junction dynamically
greenTime = (junctionTraffic / totalTraffic) * totalCycleTime

// Constraints ensure safety and throughput:
greenTime = Math.max(20, Math.min(60, greenTime))
// Minimum green: 20s | Maximum green: 60s | Cycle: 180s
```

---

## 🤝 Contributing & Support

We welcome contributions from the community. Please fork the repository, make changes, and open a Pull Request.

* **Email:** support@flowguardai.com
* **Website:** [https://flow-guard-ecru.vercel.app/](https://flow-guard-ecru.vercel.app/)

---
<div align="center">

### 🚦 Making Bangalore's Traffic Smarter, One Junction at a Time 🚦

Made with 💚 in Bangalore | Powered by AI & Machine Learning

</div>
