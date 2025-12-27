// client/src/pages/DispatchDashboard.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaAmbulance, FaFireExtinguisher, FaBuilding, FaCar, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';
const REFRESH_INTERVAL_MS = 3000; // Poll for new data every 3 seconds

// --- TIRUNELVELI CONSTANTS ---
const TIRUNELVELI_CENTER = [8.73, 77.70]; 
const TIRUNELVELI_BOUNDS = L.latLngBounds(
    L.latLng(8.00, 77.00), // South-West corner
    L.latLng(9.50, 78.50)  // North-East corner
);

// 🌟 CHANGE: TILE LAYER - Using standard OpenStreetMap tiles for a bright, detailed road map look 🌟
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; 
const TILE_LAYER_ATTRIB = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';


// --- Custom Icon Factory ---
const getIcon = (type, status) => {
    let color;
    if (status === 'Completed' || status === 'Cancelled') color = 'green';
    else if (status === 'No Vehicle Available') color = 'gray';
    else if (type === 'Fire') color = 'red';
    else if (type === 'Medical') color = 'blue';
    else color = 'orange';

    return new L.Icon({ 
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`, 
        iconSize: [25, 41], 
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
};

const vehicleIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png', 
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const hospitalIcon = new L.Icon({ 
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', 
    iconSize: [25, 41], 
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


// -------------------------------------------------------------------------
// --- MapUpdater Component (Ensures initial view, respects user zoom) ---
// -------------------------------------------------------------------------
const MapUpdater = ({ incidents }) => {
    const map = useMap();

    useEffect(() => {
        // Ensure the map is centered on Tirunelveli on load
        if (map.getCenter().equals(L.latLng(0, 0))) { // Check if it's the initial (0,0) center
            map.setView(TIRUNELVELI_CENTER, 12);
        }
    }, [map, incidents]);

    return null;
};


// -------------------------------------------------------------------------
// --- NewUtilityPanel Component (Replaces Incident Details Panel) ---
// -------------------------------------------------------------------------
const NewUtilityPanel = ({ allVehicles, activeIncidents }) => {
    const availableVehicles = allVehicles.filter(v => v.status === 'Available');
    const enRouteVehicles = allVehicles.filter(v => v.status === 'EnRoute' || v.status === 'On Scene');
    const neededVehicles = activeIncidents.filter(i => i.status === 'Reported' || i.status === 'No Vehicle Available');
    
    // Simple mock risk score 
    const riskScore = Math.min(Math.round(neededVehicles.length / 5 * 100), 100); 

    const getStatusColor = (count) => {
        if (count > 2) return '#28a745';
        if (count > 0) return '#ffc107';
        return '#dc3545';
    };

    return (
        <div style={styles.newPanel}>
            <h3 style={styles.newPanelHeader}>
                <FaChartLine style={{ marginRight: '8px' }} /> System Real-time Metrics
            </h3>
            
            <div style={styles.metricsGrid}>
                {/* Available Vehicles */}
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Available Vehicles</p>
                    <span style={{...styles.metricValue, color: getStatusColor(availableVehicles.length)}}>{availableVehicles.length}</span>
                </div>
                
                {/* Vehicles En Route */}
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Vehicles En Route</p>
                    <span style={{...styles.metricValue, color: enRouteVehicles.length > 0 ? '#007bff' : '#6c757d'}}>{enRouteVehicles.length}</span>
                </div>
                
                {/* Pending Requests */}
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Unresolved Incidents</p>
                    <span style={{...styles.metricValue, color: neededVehicles.length > 0 ? '#dc3545' : '#28a745'}}>{neededVehicles.length}</span>
                </div>

                {/* Dispatch Load Score */}
                <div style={styles.metricCard}>
                    <p style={styles.metricLabel}>Dispatch Load Score</p>
                    <span style={{...styles.metricValue, color: riskScore < 30 ? '#28a745' : riskScore < 60 ? '#ffc107' : '#dc3545'}}>{riskScore}%</span>
                </div>
            </div>

            <h3 style={{...styles.newPanelHeader, marginTop: '20px'}}>
                <FaShieldAlt style={{ marginRight: '8px' }} /> Emergency Checklist
            </h3>
            <ul style={styles.checklist}>
                <li><span style={{color: '#28a745'}}>&#10003;</span> Confirm location via call/CCTV.</li>
                <li><span style={{ color: '#dc3545' }}>&#10007;</span> Prioritize incidents with Severity &gt; 0.8.</li>
                <li><span style={{ color: '#ffc107' }}>&#9679;</span> Monitor ETA changes for traffic.</li>
                <li><span style={{ color: '#007bff' }}>&#9679;</span> Coordinate handoff with suggested hospital.</li>
            </ul>

            <p style={{fontSize: '0.8em', color: '#6c757d', textAlign: 'center', marginTop: '20px'}}>
                System updated every {REFRESH_INTERVAL_MS / 1000} seconds.
            </p>
        </div>
    );
};


// -------------------------------------------------------------------------
// --- DispatchDashboard Main Component ---
// -------------------------------------------------------------------------
const DispatchDashboard = () => {
    const [allIncidents, setAllIncidents] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllData = useCallback(async () => {
        try {
            const [incidentsRes, vehiclesRes] = await Promise.all([
                axios.get(`${API_URL}/incidents`),
                axios.get(`${API_URL}/vehicles`)
            ]);
            setAllIncidents(incidentsRes.data);
            setAllVehicles(vehiclesRes.data);
        } catch (err) {
            setError('Could not load dispatch data. Check server connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, REFRESH_INTERVAL_MS); 
        return () => clearInterval(interval);
    }, [fetchAllData]);

    
    // --- INCIDENT QUEUE LOGIC (Updated to filter by Today) ---
    const { activeIncidents, completedIncidents } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const active = [];
        const completed = [];

        allIncidents.forEach(incident => {
            const incidentDate = new Date(incident.createdAt);
            incidentDate.setHours(0, 0, 0, 0);

            if (incident.status === 'Completed' || incident.status === 'Cancelled') {
                completed.push(incident);
            } 
            // LOGIC: Only show incidents created today in the Active Queue 
            else if (incidentDate.getTime() === today.getTime()) {
                active.push(incident);
            }
        });

        // Sort completed incidents by newest first (descending creation time)
        completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Sort active incidents by severity (descending) and then time (newest first)
        active.sort((a, b) => {
            if (b.severityScore !== a.severityScore) {
                return b.severityScore - a.severityScore;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return { activeIncidents: active, completedIncidents: completed };
    }, [allIncidents]);


    // --- MAP RENDERING DATA ---
    const getCoords = useCallback((data) => [data.coordinates[1], data.coordinates[0]], []);

    const markers = useMemo(() => {
        const items = [];
        const processedIncidents = new Set();
        
        // Show all active incidents and the 5 most recent completed incidents on the map for context
        const incidentsToShowOnMap = activeIncidents.concat(
            completedIncidents.filter((inc, index) => index < 5)
        );
        
        incidentsToShowOnMap.forEach(incident => {
            if (incident.location?.coordinates) {
                const incidentCoords = getCoords(incident.location);
                processedIncidents.add(incident._id);

                // Incident Marker
                items.push(
                    <Marker 
                        key={`inc-${incident._id}`} 
                        position={incidentCoords} 
                        icon={getIcon(incident.type, incident.status)}
                    >
                        <Popup>
                            <strong>Incident #{incident._id.substring(0, 8)}</strong><br/>
                            Type: {incident.type} (S: {incident.severityScore})<br/>
                            Status: {incident.status}<br/>
                            Assigned: {incident.assignedVehicle?.vehicleID || 'None'}
                        </Popup>
                    </Marker>
                );

                // Suggested Hospital Marker
                if (incident.suggestedHospital?.location?.coordinates) {
                    const hospitalCoords = getCoords(incident.suggestedHospital.location);
                    items.push(
                        <Marker 
                            key={`hosp-${incident._id}`} 
                            position={hospitalCoords} 
                            icon={hospitalIcon}
                        >
                            <Popup>Destination: {incident.suggestedHospital.name || 'Hospital'}</Popup>
                        </Marker>
                    );
                }

                // Assigned Vehicle Marker and Route
                if (incident.assignedVehicle?.currentLocation?.coordinates && incident.status !== 'Completed' && incident.status !== 'Cancelled') {
                    const vehicleCoords = getCoords(incident.assignedVehicle.currentLocation);
                    
                    // Vehicle Marker
                    items.push(
                        <Marker 
                            key={`veh-${incident.assignedVehicle._id}`} 
                            position={vehicleCoords} 
                            icon={vehicleIcon} // Use distinct yellow icon for active vehicles
                        >
                            <Popup>
                                <strong>{incident.assignedVehicle.vehicleID} ({incident.assignedVehicle.type})</strong><br/>
                                Driver: {incident.assignedVehicle.driverName}<br/>
                                Status: **{incident.assignedVehicle.status}**
                            </Popup>
                        </Marker>
                    );

                    // Line from vehicle to incident
                    items.push(
                        <Polyline 
                            key={`line-veh-${incident._id}`} 
                            pathOptions={{ color: '#000000ff', weight: 4, dashArray: '10, 5' }} 
                            positions={[vehicleCoords, incidentCoords]} 
                        />
                    );
                }
            }
        });
        return items;
    }, [activeIncidents, completedIncidents, getCoords]);

    
    // --- Incident List Item Component ---
const IncidentListItem = ({ incident }) => {
    const isCompleted = incident.status === 'Completed' || incident.status === 'Cancelled';
    const color = isCompleted ? '#28a745' : (incident.status === 'No Vehicle Available' ? '#6c757d' : '#dc3545');
    
    const timeDiff = new Date() - new Date(incident.createdAt);
    const minutes = Math.floor(timeDiff / 60000);
    const timeAgo = minutes > 0 ? `${minutes} min ago` : 'Just now';

    const Icon = incident.type === 'Medical' ? FaAmbulance : (incident.type === 'Fire' ? FaFireExtinguisher : FaCar);

    return (
        // Open tracking page in a new tab when clicked
        <div 
            style={{ ...styles.incidentItem, borderLeft: `5px solid ${color}`, opacity: isCompleted ? 0.8 : 1 }} 
            // 🛑 FIX APPLIED HERE: Changed /tracking/ to /track/ 🛑
            onClick={() => window.open(`/track/${incident._id}`, '_blank')}
        >
            <div style={styles.incidentItemHeader}>
                <Icon style={{ color: color, marginRight: '8px' }} />
                <span style={{ fontWeight: 'bold' }}>{incident.type} (S: {incident.severityScore})</span>
            </div>
            <div style={styles.incidentItemDetails}>
                <p style={{ margin: '3px 0' }}>Status: **{incident.status}**</p>
                {isCompleted ? (
                    <p style={{ margin: '3px 0', fontSize: '0.8em', color: '#6c757d' }}>Closed: {new Date(incident.createdAt).toLocaleTimeString()}</p>
                ) : (
                    <p style={{ margin: '3px 0', fontSize: '0.8em', color: '#6c757d' }}>Time: {timeAgo}</p>
                )}
                {incident.assignedVehicle && <p style={{ margin: '3px 0', fontSize: '0.8em', fontWeight: 'bold' }}>Vehicle: {incident.assignedVehicle.vehicleID}</p>}
            </div>
        </div>
    );
};

    if (loading) return <div style={styles.center}><p>Loading Dispatch Data...</p></div>;
    if (error) return <div style={styles.center}><p style={{color: '#dc3545', fontWeight: 'bold'}}>{error}</p></div>;

    return (
        <div style={styles.pageContainer}>
            
            {/* 1. Incident Queue Sidebar (Left Side) */}
            <div style={styles.sidebar}>

                {/* 1a. Completed Incidents (Required to be First) */}
                <div style={styles.queueContainer}>
                    <h3 style={styles.queueHeader}>
                        <FaCheckCircle style={{ marginRight: '8px', color: '#28a745' }} /> Completed Incidents ({completedIncidents.length})
                    </h3>
                    <div style={styles.incidentList}>
                        {completedIncidents.slice(0, 15).map(incident => ( // Show top 15 completed
                            <IncidentListItem key={incident._id} incident={incident} />
                        ))}
                        {completedIncidents.length === 0 && <p style={styles.noIncidents}>No completed incidents yet.</p>}
                    </div>
                </div>
                
                {/* 1b. Active Incident Queue (Today's Incidents Only) */}
                <div style={{...styles.queueContainer, marginTop: '20px'}}>
                    <h3 style={{...styles.queueHeader, color: '#dc3545'}}>
                        <FaExclamationTriangle style={{ marginRight: '8px' }} /> Active Incident Queue (Today: {activeIncidents.length})
                    </h3>
                    <div style={styles.incidentList}>
                        {activeIncidents.map(incident => (
                            <IncidentListItem key={incident._id} incident={incident} />
                        ))}
                        {activeIncidents.length === 0 && <p style={styles.noIncidents}>No active incidents reported today.</p>}
                    </div>
                </div>
            </div>

            {/* 2. Main Map View (Center) */}
            <div style={styles.mapContainer}>
                <MapContainer 
                    center={TIRUNELVELI_CENTER} 
                    zoom={12} 
                    style={styles.mapStyle}
                    maxBounds={TIRUNELVELI_BOUNDS} 
                    minZoom={10} 
                    maxBoundsViscosity={1.0}
                    // Allow user zoom control (default Leaflet behavior)
                >
                    <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIB} />
                    
                    <MapUpdater incidents={allIncidents} />

                    {markers}
                </MapContainer>
            </div>

            {/* 3. New Utility Panel (Right Side) */}
            <NewUtilityPanel 
                allVehicles={allVehicles}
                activeIncidents={activeIncidents} 
            />

        </div>
    );
};

// --- Styles (Updated for Dark Theme and 3-Column Layout) ---
const styles = {
    pageContainer: {
        display: 'flex',
        height: 'calc(100vh - 80px)', // Adjust for header height
        padding: '10px',
        backgroundColor: '#e9ecef', // Light background for the overall page
        gap: '10px',
    },
    sidebar: {
        width: '250px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '10px',
        overflowY: 'auto',
        flexShrink: 0,
    },
    mapContainer: {
        flexGrow: 1, // Takes up the most space
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
    mapStyle: {
        height: '100%',
        width: '100%',
    },
    newPanel: {
        width: '250px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        padding: '15px',
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
    },
    // --- Queue Styles ---
    queueContainer: {
        marginBottom: '15px',
    },
    queueHeader: {
        fontSize: '1.1em',
        fontWeight: 'bold',
        color: '#343a40',
        marginBottom: '10px',
        borderBottom: '2px solid #ccc',
        paddingBottom: '5px',
        display: 'flex',
        alignItems: 'center',
    },
    incidentList: {
        maxHeight: '40vh',
        overflowY: 'auto',
        paddingRight: '5px',
    },
    incidentItem: {
        padding: '8px',
        marginBottom: '8px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    incidentItemHeader: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.95em',
    },
    incidentItemDetails: {
        fontSize: '0.9em',
        paddingLeft: '30px',
    },
    noIncidents: {
        color: '#6c757d',
        fontSize: '0.9em',
        textAlign: 'center',
        padding: '10px 0',
    },
    // --- New Panel Styles ---
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '15px',
    },
    metricCard: {
        backgroundColor: '#f0f4f8',
        borderRadius: '6px',
        padding: '10px',
        textAlign: 'center',
        border: '1px solid #dee2e6',
    },
    metricLabel: {
        fontSize: '0.8em',
        color: '#6c757d',
        margin: '0 0 5px 0',
        fontWeight: '500',
    },
    metricValue: {
        fontSize: '1.8em',
        fontWeight: 'bolder',
        display: 'block',
    },
    newPanelHeader: {
        fontSize: '1.2em',
        color: '#007bff',
        marginBottom: '10px',
        borderBottom: '1px solid #007bff33',
        paddingBottom: '5px',
        display: 'flex',
        alignItems: 'center',
    },
    checklist: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        fontSize: '0.9em',
    }
};

export default DispatchDashboard;