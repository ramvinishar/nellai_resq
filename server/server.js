import express from 'express';
import './models/Incident.js';
import './models/Vehicle.js';
import './models/Hospital.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import apiRoutes from './routes/api.js';


dotenv.config();
connectDB(); 

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = "http://localhost:5173"; 

const io = new SocketIOServer(server, {
    cors: {
        origin: CLIENT_ORIGIN, 
        methods: ["GET", "POST"],
        credentials: true 
    },
    // Adding transports helps stabilize the "WebSocket is closed" error
    transports: ['websocket', 'polling'] 
});

app.use(express.json()); 

const corsOptions = {
    origin: CLIENT_ORIGIN,
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use('/api', apiRoutes); 
app.get('/', (req, res) => res.send('API is running...'));

// --- SOCKET.IO REAL-TIME DISPATCH LOGIC ---
io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    // 1. DRIVER JOINS PRIVATE ROOM
    // When a driver logs in, they join a room named after their Vehicle ID
   // Inside your io.on('connection', (socket) => { ... }) block

// 1. Driver joins their own private room on login
socket.on('join_vehicle_room', (vehicleId) => {
    socket.join(vehicleId);
    console.log(`🚑 Vehicle ${vehicleId} is now ready for voice dispatch.`);
});

// 2. When patient presses SOS, server sends alert to the assigned driver
// server.js
socket.on('new_emergency_sos', (incidentData) => {
    // 1. Check if incidentData actually exists to prevent the crash
    if (!incidentData) {
        console.error("⚠️ Received empty incident data from frontend.");
        return; 
    }

    // 2. Use Optional Chaining (?.) to safely access the ID
    const targetDriver = incidentData.assignedVehicle?.vehicleID; 
    
    if (targetDriver) {
        console.log(`🚨 Dispatching Voice Alert to: ${targetDriver}`);
        io.to(targetDriver).emit('incoming_sos_alert', incidentData);
    } else {
        console.log("⚠️ No specific driver assigned to this incident yet.");
        // Optional: Broadcast to all drivers if no specific one is found
        io.emit('incoming_sos_alert', incidentData);
    }
});

    // 3. LOCATION UPDATES
    socket.on('send_vehicle_location', (data) => {
        // Broadcast location so patient can see ambulance moving on map
        io.emit('location_update', data); 
    });

    // 4. STATUS UPDATES (EnRoute -> OnScene -> Completed)
    socket.on('update_incident_status', (data) => {
        console.log(`Incident ${data.incidentId} status changed to: ${data.status}`);
        // Notify the patient dashboard specifically
        io.emit('status_updated', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});