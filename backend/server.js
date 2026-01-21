const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Load environment variables from the root directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to ensure MongoDB connection (important for serverless)
app.use(async (req, res, next) => {
    try {
        // Ensure connection before processing request
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        next();
    } catch (err) {
        console.error('MongoDB connection failed in middleware:', err.message);
        const isMissingConfig = err.message.includes('not configured');
        res.status(503).json({
            detail: isMissingConfig
                ? 'MongoDB connection string not configured. Please set MONGODB_URL in Vercel environment variables.'
                : 'Database connection failed. Please check your MongoDB connection string and try again.',
            error: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' ? err.message : undefined
        });
    }
});

// Configure Multer for file uploads
// Use /tmp for Vercel serverless functions (only writable directory)
const upload = multer({
    dest: process.env.VERCEL ? '/tmp' : 'uploads/'
});

// MongoDB Connection
// Handle connection for serverless environments (Vercel)
let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
        return;
    }

    // If already connecting, wait for that connection
    if (isConnecting && connectionPromise) {
        return connectionPromise;
    }

    // Start new connection
    isConnecting = true;
    connectionPromise = (async () => {
        try {
            const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;

            // Check if MongoDB URL is configured
            if (!mongoUrl) {
                const error = new Error('MongoDB connection string not configured. Please set MONGODB_URL environment variable in Vercel.');
                console.error('❌', error.message);
                isConnecting = false;
                connectionPromise = null;
                throw error;
            }

            // Disable mongoose buffering globally for serverless
            mongoose.set('bufferCommands', false);

            // Log connection attempt (without exposing password)
            const urlForLogging = mongoUrl.replace(/:[^:@]+@/, ':****@');
            console.log('🔄 Attempting MongoDB connection to:', urlForLogging);

            await mongoose.connect(mongoUrl, {
                serverSelectionTimeoutMS: 15000, // Increased to 15 seconds
                socketTimeoutMS: 45000, // 45 seconds
                connectTimeoutMS: 15000, // 15 seconds
                maxPoolSize: 10, // Maintain up to 10 socket connections
                minPoolSize: 1, // Maintain at least 1 socket connection
                bufferCommands: false, // Disable mongoose buffering
            });
            console.log('✅ MongoDB Connected successfully');
            isConnecting = false;
            return true;
        } catch (err) {
            console.error('❌ MongoDB Connection Error:', err.message);
            console.error('Error details:', {
                name: err.name,
                code: err.code,
                codeName: err.codeName,
                message: err.message
            });
            isConnecting = false;
            connectionPromise = null;
            // Close any partial connection
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close().catch(() => { });
            }
            throw err;
        }
    })();

    return connectionPromise;
};

// Connect to MongoDB on startup (non-blocking for serverless)
if (!process.env.VERCEL) {
    connectDB().catch(err => {
        console.error('Initial MongoDB connection failed:', err);
    });
}

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

// Health check endpoint to test MongoDB connection
app.get('/api/health', async (req, res) => {
    try {
        const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI;
        const hasMongoUrl = !!mongoUrl;
        const connectionState = mongoose.connection.readyState;
        const stateNames = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        // Try to connect if not connected
        if (connectionState !== 1) {
            try {
                await connectDB();
            } catch (err) {
                return res.status(503).json({
                    status: 'error',
                    mongodb: {
                        configured: hasMongoUrl,
                        connectionState: stateNames[connectionState] || 'unknown',
                        error: err.message,
                        urlPresent: hasMongoUrl ? 'Yes (hidden for security)' : 'No'
                    },
                    message: 'MongoDB connection failed',
                    help: hasMongoUrl
                        ? 'Check your MongoDB connection string and ensure MongoDB Atlas allows connections from Vercel (Network Access: 0.0.0.0/0)'
                        : 'Set MONGODB_URL environment variable in Vercel'
                });
            }
        }

        // Test a simple query
        try {
            await Vehicle.findOne().limit(1);
            res.json({
                status: 'ok',
                mongodb: {
                    configured: hasMongoUrl,
                    connectionState: 'connected',
                    urlPresent: 'Yes (hidden for security)'
                },
                message: 'MongoDB connection successful'
            });
        } catch (err) {
            res.status(503).json({
                status: 'error',
                mongodb: {
                    configured: hasMongoUrl,
                    connectionState: stateNames[connectionState] || 'unknown',
                    error: err.message
                },
                message: 'MongoDB query failed'
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 'error',
            error: err.message
        });
    }
});

// 1. Register Vehicle
app.post('/api/vehicles/register', async (req, res) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }

        // Double check connection before querying
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                detail: 'Database not connected. Please check your MongoDB connection string.'
            });
        }

        const existing = await Vehicle.findOne({ vehicleNumber: req.body.vehicleNumber });
        if (existing) return res.status(400).json({ detail: 'Vehicle already registered' });

        const newVehicle = new Vehicle(req.body);
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (err) {
        console.error('Vehicle registration error:', err);
        console.error('Error details:', {
            name: err.name,
            code: err.code,
            message: err.message,
            stack: err.stack
        });

        // Handle MongoDB connection errors
        if (err.message && (err.message.includes('buffering timed out') || err.message.includes('timeout'))) {
            return res.status(503).json({
                detail: 'Database connection timeout. Please check: 1) MONGODB_URL is set in Vercel, 2) MongoDB Atlas Network Access allows all IPs (0.0.0.0/0), 3) Connection string is correct.',
                error: process.env.VERCEL_ENV === 'development' ? err.message : undefined
            });
        }

        if (err.name === 'MongoServerError' && err.code === 11000) {
            return res.status(400).json({ detail: 'Vehicle already registered' });
        }

        if (err.message && err.message.includes('not configured')) {
            return res.status(503).json({
                detail: 'MongoDB connection string not configured. Please set MONGODB_URL in Vercel environment variables.'
            });
        }

        if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
            return res.status(503).json({
                detail: 'Cannot connect to MongoDB. Please check: 1) MongoDB Atlas Network Access allows all IPs (0.0.0.0/0), 2) Connection string is correct, 3) Database user has proper permissions.',
                error: process.env.VERCEL_ENV === 'development' ? err.message : undefined
            });
        }

        res.status(500).json({
            detail: err.message || 'Failed to register vehicle',
            error: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development' ? err.message : undefined
        });
    }
});

// 2. Get All Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        const vehicles = await Vehicle.find().sort({ registeredOn: -1 });
        res.json(vehicles);
    } catch (err) {
        console.error('Get vehicles error:', err);
        res.status(500).json({ detail: err.message || 'Failed to fetch vehicles' });
    }
});

// 3. Get Single Vehicle
app.get('/api/vehicles/:vehicleNumber', async (req, res) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
        if (!vehicle) return res.status(404).json({ detail: 'Vehicle not found' });
        res.json(vehicle);
    } catch (err) {
        console.error('Get vehicle error:', err);
        res.status(500).json({ detail: err.message || 'Failed to fetch vehicle' });
    }
});

// 4. Update Status (Missing/Found)
app.put('/api/vehicles/:vehicleNumber/status', async (req, res) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
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
        console.error('Update vehicle status error:', err);
        res.status(500).json({ detail: err.message || 'Failed to update vehicle status' });
    }
});

// 5. Issue Fine
app.post('/api/vehicles/:vehicleNumber/fine', async (req, res) => {
    try {
        // Ensure MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
        const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
        if (!vehicle) return res.status(404).json({ detail: 'Vehicle not found' });

        vehicle.fineHistory.push(req.body);
        await vehicle.save();
        res.json({ message: 'Fine issued successfully' });
    } catch (err) {
        console.error('Issue fine error:', err);
        res.status(500).json({ detail: err.message || 'Failed to issue fine' });
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
        try {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cleanupErr) {
            console.error('File cleanup error:', cleanupErr);
        }

        res.json(response.data);
    } catch (err) {
        console.error('AI Service Error:', err.message);
        // Clean up uploaded file if it exists
        try {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (cleanupErr) {
            console.error('File cleanup error:', cleanupErr);
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

