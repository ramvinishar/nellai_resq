// server/routes/api.js

import express from 'express';
import Incident from '../models/Incident.js';
import Vehicle from '../models/Vehicle.js';
import Hospital from '../models/Hospital.js'; 
import mongoose from 'mongoose'; 
import { triggerTamilDispatch } from '../utils/voiceService.js'; // 👈 Add this
import { CONGESTION_POINTS, MOCK_USER_CREDENTIALS } from '../config/data.js';

const router = express.Router();

// =========================================================
// 🚨 CONFIGURATION CHANGE: Set Automatic Completion Delay 🚨
// =========================================================
// server/routes/api.js

const TRAVEL_TIME_SIMULATION = 30 * 1000;      // 30 seconds of 'En Route' to see ETA
const INCIDENT_COMPLETION_DELAY = 60 * 1000;    // 1 minute (60,000ms)
const VEHICLE_AVAILABILITY_DELAY = 180 * 1000;  // 3 minutes (180,000ms) // 1 minute simulated clearance time

// =========================================================
// 🚨 MODEL DEFINITIONS 🚨
// =========================================================

// Define the Feedback Schema
const feedbackSchema = new mongoose.Schema({
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, unique: true }, 
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String, trim: true, default: '' },
    submittedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// 🆕 NEW: Define the User Schema for real login/registration
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // For hackathons, plain text is okay; use bcrypt for production
    role: { type: String, required: true },
    vehicleId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// =========================================================
// 🚨 HELPER FUNCTIONS 🚨
// =========================================================
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
};

// =========================================================
// 🚨 AUTHENTICATION ROUTES (UPDATED) 🚨
// =========================================================

// --- POST /api/login: Checks MongoDB first, then MOCK data ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Check Database first for registered users
        const dbUser = await User.findOne({ username });
        
        if (dbUser && dbUser.password === password) {
            return res.json({ 
                success: true, 
                user: { 
                    username: dbUser.username, 
                    role: dbUser.role, 
                    vehicleId: dbUser.vehicleId || null 
                } 
            });
        }

        // 2. Fallback to Mock Data (so old hardcoded users still work)
        const mockUser = MOCK_USER_CREDENTIALS.find(u => u.username === username && u.password === password);
        
        if (mockUser) {
            return res.json({ 
                success: true, 
                user: { 
                    username: mockUser.username, 
                    role: mockUser.role, 
                    vehicleId: mockUser.vehicleId || null 
                } 
            });
        }

        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// --- POST /api/register: Saves new staff to MongoDB ---
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, vehicleId } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create the user in the database
        const newUser = await User.create({ 
            username, 
            password, 
            role, 
            vehicleId 
        });

        res.status(201).json({ 
            success: true, 
            message: 'Staff registered successfully!',
            user: { username: newUser.username, role: newUser.role, vehicleId: newUser.vehicleId }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// =========================================================
// 🚨 SOS & DISPATCH ROUTES 🚨
// =========================================================

router.post('/sos', async (req, res) => {
    const { incidentType, userLocation } = req.body; 

    const incidentLon = userLocation?.coordinates?.[0];
    const incidentLat = userLocation?.coordinates?.[1];
    
    if (userLocation.type !== 'Point' || !Array.isArray(userLocation.coordinates) || 
        typeof incidentLat !== 'number' || typeof incidentLon !== 'number') {
        return res.status(400).json({ message: 'Invalid GeoJSON location data provided.' });
    }
    
    let severityScore = incidentType === 'Fire' ? 0.9 : (incidentType === 'Medical' ? 0.8 : 0.6);

    try {
        let suggestedHospital = null;
        if (incidentType === 'Medical') {
            const allHospitals = await Hospital.find({});
            let nearestHospital = null;
            let lowestDistance = Infinity;

            for (const hospital of allHospitals) {
                if (!hospital.location?.coordinates) continue;
                const distance = getDistance(incidentLat, incidentLon, hospital.location.coordinates[1], hospital.location.coordinates[0]);
                if (distance < lowestDistance) {
                    lowestDistance = distance;
                    nearestHospital = hospital;
                }
            }
            if (nearestHospital) {
                suggestedHospital = { name: nearestHospital.name, location: nearestHospital.location };
            }
        }

        const newIncident = await Incident.create({
            type: incidentType,
            severityScore,
            location: { type: 'Point', coordinates: [incidentLon, incidentLat] },
            status: 'Reported',
            suggestedHospital
        });

        // 🚨 MATCHING LOGIC: Your DB uses "Police", "Ambulance", "Fire Service"
        const requiredType = incidentType === 'Medical' ? 'Ambulance' : (incidentType === 'Fire' ? 'Fire Service' : 'Police');
        const availableVehicles = await Vehicle.find({ type: requiredType, status: 'Available' });

        if (availableVehicles.length === 0) {
            newIncident.status = 'No Vehicle Available';
            await newIncident.save();
            return res.status(202).json({ incidentId: newIncident._id, message: "No vehicle available." });
        }

        let bestVehicle = null;
        let lowestOptimizedTime = Infinity;

        for (const vehicle of availableVehicles) {
            if (!vehicle.currentLocation?.coordinates) continue;
            const baseDist = getDistance(incidentLat, incidentLon, vehicle.currentLocation.coordinates[1], vehicle.currentLocation.coordinates[0]);
            let eta = baseDist * 2;
            
            for (const point of CONGESTION_POINTS) {
                if (getDistance(vehicle.currentLocation.coordinates[1], vehicle.currentLocation.coordinates[0], point.coords[1], point.coords[0]) < 1) {
                    eta += point.timePenalty; 
                    break;
                }
            }
            
            if (eta < lowestOptimizedTime) {
                lowestOptimizedTime = eta;
                bestVehicle = vehicle;
            }
        }

        if (bestVehicle) {
            newIncident.assignedVehicle = bestVehicle._id;
            newIncident.status = 'En Route';
            newIncident.initialETA = lowestOptimizedTime;
            await newIncident.save();
            await Vehicle.findByIdAndUpdate(bestVehicle._id, { status: 'En Route' });

            // =========================================================
            // 📞 NEW: TRIGGER TWILIO VOICE DISPATCH CALL 📞
            // =========================================================
            console.log(`☎️ Dispatching ${bestVehicle.driverName} via Twilio...`);
            
            // We use the real data from the vehicle we just found in the loop
            try {
                await triggerTamilDispatch(
                    bestVehicle.contactNumber, // e.g., +918148560644
                    bestVehicle.driverName,    // e.g., Inspector Singh
                    bestVehicle.vehicleID      // e.g., P102
                );
                console.log(`✅ Call successfully sent to ${bestVehicle.driverName}`);
            } catch (twilioErr) {
                console.error("❌ Twilio Failed but incident was created:", twilioErr.message);
            }
            // =========================================================
            const dynamicTravelDelay = lowestOptimizedTime * 60 * 1000;
            // Auto-Arrive Logic (Existing)
            setTimeout(async () => {
        const currentIncident = await Incident.findById(newIncident._id);
        
        // Safety check: only mark Arrived if it wasn't cancelled or changed
        if (currentIncident && currentIncident.status === 'En Route') {
            await Incident.findByIdAndUpdate(newIncident._id, { status: 'Arrived' });
            await Vehicle.findByIdAndUpdate(bestVehicle._id, { status: 'Arrived' });
            
            if (req.app.get('socketio')) {
                req.app.get('socketio').emit('incidentUpdated', { 
                    incidentId: newIncident._id, 
                    status: 'Arrived' 
                });
            }
            console.log(`📍 ETA Finished: Vehicle ${bestVehicle.vehicleID} is now Arrived.`);
        }

        // STEP 2: Now wait the 1 MINUTE "Scene Clearance" time until "Completed"
        setTimeout(async () => {
            await Incident.findByIdAndUpdate(newIncident._id, { status: 'Completed' });
            
            if (req.app.get('socketio')) {
                req.app.get('socketio').emit('incidentUpdated', { 
                    incidentId: newIncident._id, 
                    status: 'Completed' 
                });
            }
            console.log(`✅ Scene Cleared: Incident marked Completed. Feedback Modal triggered.`);

            // STEP 3: Finally wait 3 MINUTES until "Available"
            setTimeout(async () => {
                await Vehicle.findByIdAndUpdate(bestVehicle._id, { 
                    status: 'Available', 
                    assignedIncident: null 
                });
                
                if (req.app.get('socketio')) {
                    req.app.get('socketio').emit('vehicleUpdated', { 
                        vehicleId: bestVehicle.vehicleID, 
                        status: 'Available' 
                    });
                }
                console.log(`🟢 Vehicle ${bestVehicle.vehicleID} is now back in the pool.`);
            }, VEHICLE_AVAILABILITY_DELAY);

        }, INCIDENT_COMPLETION_DELAY);

    }, dynamicTravelDelay); // 👈 This is now tied to your ETA!
}
        return res.status(200).json({ 
            success: true,
            incident: newIncident, // Added this so your Socket doesn't get "Empty Data"
            incidentId: newIncident._id, 
            assignedVehicle: bestVehicle, 
            optimizedETA: lowestOptimizedTime.toFixed(1) 
        });

    } catch (error) {
        console.error("SOS Dispatch Error:", error);
        res.status(500).json({ message: 'Server error during dispatch.' });
    }
});

// =========================================================
// 🚨 FEEDBACK & DATA ROUTES 🚨
// =========================================================

router.post('/feedback', async (req, res) => {
    try {
        const { incidentId, rating, comments } = req.body;
        if (!incidentId || !rating) return res.status(400).json({ message: 'Missing fields.' });

        const existingFeedback = await Feedback.findOne({ incidentId });
        if (existingFeedback) return res.status(409).json({ message: 'Feedback already exists.' });

        const newFeedback = await Feedback.create({ incidentId, rating, comments });
        res.status(201).json({ message: 'Feedback submitted.', feedback: newFeedback });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Duplicate feedback.' });
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/incidents/active/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params; // e.g., "P102"
        
        // 1. Find the specific vehicle first
        const vehicle = await Vehicle.findOne({ vehicleID: vehicleId });
        if (!vehicle) return res.json(null);
        // Find the active incident for this vehicle
        const incident = await Incident.findOne({ 
            assignedVehicle: vehicle._id, 
            status: { $in: ['Reported', 'Dispatched', 'En Route', 'On Scene', 'Arrived'] } 
        }).populate('assignedVehicle');

        res.json(incident || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/incident/:id/status', async (req, res) => {
    try {
        const { newStatus } = req.body;
        const incident = await Incident.findById(req.params.id).populate('assignedVehicle');
        if (!incident) return res.status(404).json({ message: 'Not found.' });

        const oldStatus = incident.status;
        incident.status = newStatus;
        await incident.save();

        if (newStatus === 'Arrived' && oldStatus !== 'Arrived' && incident.assignedVehicle) {
            const vId = incident.assignedVehicle._id;
            await Vehicle.findByIdAndUpdate(vId, { status: 'On Scene' });
            setTimeout(async () => {
                await Vehicle.findByIdAndUpdate(vId, { status: 'Available', assignedIncident: null });
                await Incident.findByIdAndUpdate(req.params.id, { status: 'Completed', assignedVehicle: null });
            }, SCENE_CLEARANCE_TIME_MS);
        }
        res.status(200).json({ message: 'Status updated.' });
    } catch (error) {
        res.status(500).json({ message: 'Update error.' });
    }
});

router.put('/vehicle/status/:vId', async (req, res) => {
    try {
        const { vId } = req.params; // This will be "A002"
        const { newStatus } = req.body;

        // Search using 'vehicleID' field from your MongoDB data, not '_id'
        const updatedVehicle = await Vehicle.findOneAndUpdate(
            { vehicleID: vId }, 
            { status: newStatus },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.json(updatedVehicle);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/incidents', async (req, res) => {
    // We add .sort and ensure assignedVehicle is populated
    const incidents = await Incident.find({})
        .sort({ severityScore: -1, createdAt: -1 })
        .populate('assignedVehicle');
    res.json(incidents);
});

router.get('/vehicles', async (req, res) => {
    const vehicles = await Vehicle.find({});
    res.json(vehicles);
});

router.get('/incident/:id', async (req, res) => {
    try {
        // 1. ADD THIS CHECK: If ID is "undefined" or not a valid Mongo ID, stop immediately
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Incident ID' });
        }

        const incident = await Incident.findById(req.params.id).populate('assignedVehicle'); 
        if (!incident) return res.status(404).json({ message: 'Incident not found' });
        
        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/vehicle/updateLocation', async (req, res) => {
    const { vehicleId, lat, lon } = req.body;
    try {
        const vehicle = await Vehicle.findOneAndUpdate(
            { vehicleID: vehicleId }, 
            { 
                currentLocation: { 
                    type: 'Point', 
                    // GeoJSON standard is [Longitude, Latitude]
                    coordinates: [parseFloat(lon), parseFloat(lat)] 
                }
            }, 
            { new: true }
        );
        res.json({ success: true, vehicle });
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});
router.get('/feedback', async (req, res) => {
    try {
        // Use 'submittedAt' to match your schema definition at the top of api.js
        const feedback = await Feedback.find().sort({ submittedAt: -1 }); 
        res.status(200).json(feedback);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- GET INCIDENT HISTORY FOR A SPECIFIC VEHICLE ---
router.get('/incidents/history/:vehicleId', async (req, res) => {
    try {
        // 1. Find the vehicle object to get its internal MongoDB _id
        const vehicle = await Vehicle.findOne({ vehicleID: req.params.vehicleId });
        
        if (!vehicle) {
            // Return empty array instead of error so the UI doesn't crash
            return res.json([]); 
        }

        // 2. Find all incidents assigned to that vehicle that are 'Completed'
        const history = await Incident.find({ 
            assignedVehicle: vehicle._id, 
            status: 'Completed' 
        })
        .populate('assignedVehicle')
        .sort({ createdAt: -1 }); // Show newest first

        res.json(history);
    } catch (err) {
        console.error("History fetch error:", err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// --- GET ALL HEROES (DRIVERS FROM VEHICLES COLLECTION) ---
router.get('/heroes', async (req, res) => {
    try {
        // This uses the Vehicle model you already defined at the top of api.js
        // It fetches everything from the 'vehicles' collection in MongoDB
        const drivers = await Vehicle.find({}); 
        
        if (!drivers || drivers.length === 0) {
            return res.status(404).json({ message: "No drivers found in database" });
        }

        res.status(200).json(drivers);
    } catch (err) {
        console.error("Error fetching heroes:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;