// server/models/Hospital.js (CORRECTED - FINAL VERSION)

import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    location: {
        // GeoJSON Point Schema
        type: {
            type: String, 
            enum: ['Point'], 
            default: 'Point',
        },
        coordinates: { // [Longitude, Latitude]
            type: [Number], 
            required: true, 
            index: '2dsphere' 
        }
    },
}, {
    timestamps: true
});

// 🌟 THE FIX: Explicitly specify the collection name 'hospitals' 🌟
const Hospital = mongoose.model('Hospital', HospitalSchema, 'hospitals'); 
export default Hospital;