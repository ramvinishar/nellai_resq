import Vehicle from '../models/Vehicle.js';
import Incident from '../models/Incident.js';
import { triggerTamilDispatch } from '../utils/voiceService.js';

export const handleSOS = async (req, res) => {
    console.log("🚨 SOS Request Received!");

    try {
        const { incidentType, userLocation } = req.body; 

        // 1. DYNAMIC FETCH: Find the nearest Available vehicle of that specific type
        const vehicle = await Vehicle.findOne({
            type: incidentType, // Matches "Police", "Medical", etc. from your dropdown
            status: "Available",
            currentLocation: {
                $near: {
                    $geometry: userLocation, // [longitude, latitude]
                    $maxDistance: 20000 // Within 20km
                }
            }
        });

        if (!vehicle) {
            console.log(`❌ No available ${incidentType} vehicles found nearby.`);
            return res.status(404).json({ message: `No ${incidentType} units available.` });
        }

        // 2. EXTRACT REAL DATA: Use your DB fields like driverName and contactNumber
        const { driverName, contactNumber, vehicleID } = vehicle;
        console.log(`📡 Assigned: ${driverName} (${vehicleID}) at ${contactNumber}`);

        // 3. TRIGGER TWILIO: Pass the real DB name and ID to the voice flow
        await triggerTamilDispatch(contactNumber, driverName, vehicleID);

        // 4. SAVE INCIDENT: Link the actual assigned vehicle record
        const newIncident = await Incident.create({
            type: incidentType,
            location: userLocation,
            assignedVehicle: vehicle._id, 
            status: 'Dispatched'
        });

        // 5. RETURN TO FRONTEND: This ensures your Socket.io emit has data
        res.status(200).json({ 
            success: true, 
            incident: {
                ...newIncident._doc,
                assignedVehicle: vehicle // Nesting the vehicle data for the socket
            },
            incidentId: newIncident._id 
        });

    } catch (error) {
        console.error("❌ SOS Error:", error.message);
        res.status(500).json({ error: "Failed to dispatch emergency services." });
    }
};