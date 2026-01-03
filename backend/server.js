const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/flowguard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- Schemas & Models ---

const FineSchema = new mongoose.Schema({
    amount: Number,
    reason: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' },
    issuedBy: { type: String, default: 'Traffic Department' }
});

const VehicleSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true },
    name: String,
    phone: String,
    email: String,
    address: String,
    isMissing: { type: String, default: 'No' },
    model: String,
    color: String,
    chassisNumber: String,
    engineNumber: String,
    insuranceExpiry: String,
    registrationDate: String,
    registeredOn: { type: Date, default: Date.now },
    status: { type: String, default: 'active' },
    foundDate: Date,
    fineHistory: [FineSchema]
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

// --- Routes ---

// 1. Register Vehicle
app.post('/api/vehicles/register', async (req, res) => {
    try {
        const existing = await Vehicle.findOne({ vehicleNumber: req.body.vehicleNumber });
        if (existing) return res.status(400).json({ detail: 'Vehicle already registered' });

        const newVehicle = new Vehicle(req.body);
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        res.status(500).json({ detail: err.message });
    }
});

// 2. Get All Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ registeredOn: -1 });
        res.json(vehicles);
    } catch (err) {
        res.status(500).json({ detail: err.message });
    }
});

// 3. Get Single Vehicle
app.get('/api/vehicles/:vehicleNumber', async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
        if (!vehicle) return res.status(404).json({ detail: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        res.status(500).json({ detail: err.message });
    }
});

// 4. Update Status (Missing/Found)
app.put('/api/vehicles/:vehicleNumber/status', async (req, res) => {
    try {
        const { status, is_missing } = req.query;
        const updateData = { status, isMissing: is_missing };
        if (status === 'active') updateData.foundDate = new Date();

        const updated = await Vehicle.findOneAndUpdate(
            { vehicleNumber: req.params.vehicleNumber },
            updateData,
            { new: true }
        );

        if (!updated) return res.status(404).json({ detail: 'Vehicle not found' });
        res.json({ message: 'Status updated successfully', vehicle: updated });
    } catch (err) {
        res.status(500).json({ detail: err.message });
    }
});

// 5. Issue Fine
app.post('/api/vehicles/:vehicleNumber/fine', async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
        if (!vehicle) return res.status(404).json({ detail: 'Vehicle not found' });

        vehicle.fineHistory.push(req.body);
        await vehicle.save();
        res.json({ message: 'Fine issued successfully' });
    } catch (err) {
        res.status(500).json({ detail: err.message });
    }
});

// --- Proxy Routes to AI Service ---

// 6. Traffic Prediction Proxy
app.post('/api/predict/traffic', async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/predict/traffic`, req.body);
        res.json(response.data);
    } catch (err) {
        console.error('AI Service Error:', err.message);
        res.status(502).json({ detail: 'AI Service Unavailable' });
    }
});

// 7. License Plate Detection Proxy
app.post('/api/detect/plate', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ detail: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        const response = await axios.post(`${AI_SERVICE_URL}/detect/plate`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(response.data);
    } catch (err) {
        console.error('AI Service Error:', err.message);
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(502).json({ detail: 'AI Service Unavailable' });
    }
});


// Only listen if run directly (not required for Vercel, but good for local dev)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Node.js Backend running on port ${PORT}`);
    });
}

module.exports = app;

