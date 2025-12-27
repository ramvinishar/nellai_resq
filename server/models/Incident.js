// server/models/Incident.js (CORRECTED)

import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema({
    type: { // e.g., 'Medical', 'Fire', 'Accident'
        type: String,
        required: true,
    },
    location: {
        // Standard GeoJSON Point for mapping/geospatial queries
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            required: true,
            index: '2dsphere' // Essential for 'near' queries
        }
    },
    severityScore: { // Used by the AI Triage Logic
        type: Number,
        default: 0.5,
    },
    status: { // e.g., 'New', 'Pending', 'Dispatched', 'Resolved'
        type: String,
        default: 'New',
    },
    
    // 💥 ADD THIS FIELD 💥
    initialETA: {
        type: Number, // Stores the dynamic ETA (e.g., 6.1 minutes)
        default: null,
    },
    // 💥 END OF ADDITION 💥

    // 🌟 FIX: ADDED suggestedHospital SCHEMA 🌟
    suggestedHospital: {
        name: { type: String },
        location: {
            type: { 
                type: String, 
                enum: ['Point'] 
            }, 
            coordinates: { 
                type: [Number] // [Longitude, Latitude]
            }
        }
    },
    // 🌟 END OF FIX 🌟

    assignedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle', // Links to the Vehicle model
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Incident = mongoose.model('Incident', IncidentSchema);
export default Incident;