// server/config/data.js
// Central coordinates for map centering
export const NELLAI_CENTER = { lat: 8.7139, lon: 77.7567 }; 

// --- CRITICAL AI DATA ---
// Mock data for AI to avoid known traffic points (lon, lat)
export const CONGESTION_POINTS = [
    { name: "Tirunelveli Junction", coords: [77.7010, 8.7291], timePenalty: 10 }, // 10 min penalty
    { name: "Palayamkottai Market", coords: [77.7389, 8.7265], timePenalty: 8 },  // 8 min penalty
    { name: "KTC Nagar Choke Point", coords: [77.7330, 8.7401], timePenalty: 6 }, // 6 min penalty
];

// --- LOGIN DATA ---
export const MOCK_USER_CREDENTIALS = [
    { username: "admin", password: "123", role: "Dispatcher" },
    { username: "amb1", password: "123", role: "Responder", vehicleId: "A001" },
    { username: "police1", password: "123", role: "Responder", vehicleId: "P101" },
];

// --- INITIAL VEHICLES (Use this to manually seed your MongoDB 'vehicles' collection) ---
export const MOCK_VEHICLES_DATA = [
    { vehicleID: "A001", type: "Ambulance", currentLocation: { type: "Point", coordinates: [77.7120, 8.7305] }, status: "Available" },
    { vehicleID: "P101", type: "Police", currentLocation: { type: "Point", coordinates: [77.7450, 8.7410] }, status: "Available" },
    { vehicleID: "F501", type: "Fire Service", currentLocation: { type: "Point", coordinates: [77.7050, 8.7050] }, status: "Available" },
];