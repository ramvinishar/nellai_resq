// server/models/Vehicle.js (CORRECTED)
import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
 vehicleID: { type: String, required: true, unique: true },
type: { type: String, enum: ['Ambulance', 'Fire Service', 'Police'], required: true },
 
// Setting required: true ensures you always provide a specific place name
  baseLocation: { type: String, required: true },
 // CORRECTION: Added 'On Scene' to the allowed enum values 
status: { 
        type: String, 
        enum: ['Available', 'EnRoute', 'Arrived','On Scene', 'InMaintenance'], 
        default: 'Available' 
    },
 // END OF CORRECTION 
 
 // The GeoJSON structure for the vehicle's current location
 currentLocation: {
 type: {
 type: String, 
 enum: ['Point'], 
 default: 'Point',
},
coordinates: { // MUST be [Longitude, Latitude]
type: [Number], 
 index: '2dsphere' // Ensure this index is applied correctly
 }
 },
  
 // Assume driverID, contact, etc. are here too
 driverName: { type: String },
 contactNumber: { type: String }
}, {
 timestamps: true
});

const Vehicle = mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;