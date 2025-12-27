import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap,Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useParams } from 'react-router-dom';

// Fixed Leaflet icons to bypass tracking prevention and load correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => { if (coords) map.setView(coords, 15); }, [coords, map]);
    return null;
}

const ResponderNav = () => {
    const { vehicleId: urlVehicleId } = useParams(); 
    const [activeIncident, setActiveIncident] = useState(null);
    const [history, setHistory] = useState([]);
    const [vehiclePos, setVehiclePos] = useState([8.7139, 77.7567]); 
    const [view, setView] = useState('active'); 
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(sessionStorage.getItem('user')) || {};
    const user = {
       username: storedUser.username || "Responder", 
        vehicleId: urlVehicleId || storedUser.vehicleId, 
        role: storedUser.role || "Emergency Unit"
    };

    // Helper logic to determine emergency type
    const isMedical = activeIncident?.type?.toLowerCase().includes('medical');
    const isFire = activeIncident?.type?.toLowerCase().includes('fire');
    const isPolice = activeIncident?.type?.toLowerCase().includes('police');

    const fetchData = async () => {
        if (!user.vehicleId) {
            setLoading(false);
            return;
        }
        try {
            const activeRes = await fetch(`http://localhost:5000/api/incidents/active/${user.vehicleId}`);
            if (activeRes.ok) {
                const activeData = await activeRes.json();
                setActiveIncident(activeData);
            } else {
                setActiveIncident(null); // Clear if no active job
            }

            const historyRes = await fetch(`http://localhost:5000/api/incidents/history/${user.vehicleId}`);
            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setHistory(historyData);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Data fetch error:", err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); 
        return () => clearInterval(interval);
    }, [user.vehicleId]);

    useEffect(() => {
        if (activeIncident && activeIncident.status === 'En Route') {
            const target = activeIncident.location.coordinates;
            const moveTimer = setInterval(() => {
                setVehiclePos(prev => {
                    const newLat = prev[0] + (target[1] - prev[0]) * 0.05;
                    const newLon = prev[1] + (target[0] - prev[1]) * 0.05;
                    fetch('http://localhost:5000/api/vehicle/updateLocation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ vehicleId: user.vehicleId, lat: newLat, lon: newLon })
                    });
                    return [newLat, newLon];
                });
            }, 3000);
            return () => clearInterval(moveTimer);
        }
    }, [activeIncident]);

    const styles = {
        page: { backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
        nav: { display: 'flex', gap: '10px', marginBottom: '20px' },
        navBtn: (active) => ({
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            backgroundColor: active ? '#3b82f6' : '#1e293b', color: 'white', cursor: 'pointer', fontWeight: 'bold'
        }),
        header: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #334155' },
        card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', border: '1px solid #334155' },
        emptyState: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
        historyItem: { padding: '15px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
    };

    if (loading) return <div style={styles.page}>Loading...</div>;


    const handleStatusUpdate = async (newStatus) => {
    if (!activeIncident?._id) return;

    try {
        const response = await fetch(`http://localhost:5000/api/incidents/updateStatus`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                incidentId: activeIncident._id, 
                status: newStatus 
            }),
        });

        if (response.ok) {
            // Refresh data immediately after update
            fetchData(); 
            alert(`Status updated to: ${newStatus}`);
        } else {
            console.error("Failed to update status");
        }
    } catch (err) {
        console.error("Error updating status:", err);
    }
};


    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h2 style={{ margin: 0 }}>Responder: {activeIncident?.assignedVehicle?.driverName || user.username}</h2>
                <p style={{ color: '#60a5fa', margin: '5px 0' }}>Unit ID: {user.vehicleId} | Type: {user.role}</p>
            </div>

            <div style={styles.nav}>
                <button style={styles.navBtn(view === 'active')} onClick={() => setView('active')}>Current Job</button>
                <button style={styles.navBtn(view === 'history')} onClick={() => setView('history')}>My History</button>
            </div>

            {view === 'active' ? (
                <div>
                    {!activeIncident ? (
                        <div style={styles.card}>
                            <div style={styles.emptyState}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛰️</div>
                                <h3>No active incidents assigned.</h3>
                                <p>Standing by for dispatch commands...</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ ...styles.card, borderLeft: `5px solid ${isPolice ? '#3b82f6' : '#ef4444'}` }}>
                                {/* Dynamic Header Logic */}
                                <h3 style={{ color: isPolice ? '#3b82f6' : '#ef4444', margin: '0 0 10px 0' }}>
                                    🚨 {isMedical ? 'MEDICAL' : isFire ? 'FIRE' : isPolice ? 'POLICE' : 'URGENT'} EMERGENCY
                                </h3>
                                
                                <p style={{ margin: '5px 0' }}><strong>Location:</strong> {activeIncident.location.coordinates[1].toFixed(4)}, {activeIncident.location.coordinates[0].toFixed(4)}</p>
                                
                                {/* ✅ CONDITIONAL RENDERING: Only show hospital for Medical type */}
                                {isMedical && (
                                    <p style={{ margin: '5px 0' }}>
                                        <strong>Suggested Hospital:</strong> {activeIncident.suggestedHospital?.name || "Nearest Facility"}
                                    </p>
                                )}

                                <button 
                                    onClick={() => window.open(`https://www.google.com/maps?q=${activeIncident.location.coordinates[1]},${activeIncident.location.coordinates[0]}`)}
                                    style={{ width: '100%', marginTop: '15px', padding: '12px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    🗺️ OPEN IN GOOGLE MAPS
                                </button>
                                
                            </div>

                            <div style={{ height: '350px', borderRadius: '15px', overflow: 'hidden', border: '1px solid #334155' }}>
                                <MapContainer center={vehiclePos} zoom={15} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RecenterMap coords={vehiclePos} />
                                    {/* 1. Responder Marker (Standard Blue) */}
        <Marker position={vehiclePos}>
            <Popup>You ({user.vehicleId})</Popup>
        </Marker>

        {/* 2. Incident Marker (Red Icon) */}
        <Marker 
            position={[activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]} 
            icon={redIcon} 
        >
            <Popup> Emergency Site</Popup>
        </Marker>

        {/* 3. 🌟 PATH LINE (Polyline) 🌟 */}
        <Polyline 
            positions={[
                vehiclePos, 
                [activeIncident.location.coordinates[1], activeIncident.location.coordinates[0]]
            ]} 
            pathOptions={{ 
                color: '#3b82f6', 
                weight: 4, 
                dashArray: '10, 10', // Creates the dashed look from image_a060c9.jpg
                opacity: 0.8 
            }} 
        />
    </MapContainer>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={styles.card}>
                    <h3 style={{ margin: '0 0 15px 0' }}>Completed Missions for {user.vehicleId}</h3>
                    {history.length === 0 ? (
                        <p style={styles.emptyState}>No completed jobs found for this unit.</p>
                    ) : (
                        history.map((item, idx) => (
                            <div key={idx} style={styles.historyItem}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{item.type}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleString()}</div>
                                </div>
                                <div style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '12px' }}>✓ DONE</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ResponderNav;