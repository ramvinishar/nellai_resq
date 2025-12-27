// client/src/pages/TrackingPage.jsx (WITH FEEDBACK MODAL)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';

// --- TIRUNELVELI CONSTANTS ---
const TIRUNELVELI_CENTER = [8.73, 77.70]; 
const TIRUNELVELI_BOUNDS = L.latLngBounds(
    L.latLng(8.00, 77.00), // South-West corner
    L.latLng(9.50, 78.50)  // North-East corner
);

// MapBox Light Theme (Better visual clarity than default OSM)
// This tile layer has the same colors and fonts as Google Maps
const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_LAYER_ATTRIB = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';


// --- Custom Icons ---
const incidentIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const vehicleIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const hospitalIcon = new L.Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', iconSize: [25, 41], iconAnchor: [12, 41] });

const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    withCredentials: true
});

// 🌟 Mock Reverse Geocoding Function (Tirunelveli Focused) 🌟
const reverseGeocodeMock = (lat, lon) => {
    // Tirunelveli Junction / Railway Station Area
    if (lat > 8.7200 && lat < 8.7350 && lon > 77.6700 && lon < 77.7000) {
        return "Tirunelveli Junction Area";
    }
    // Vannarpettai / Palayamkottai Area (Your test coordinates: 8.7319, 77.7235)
    if (lat > 8.7100 && lat < 8.7400 && lon > 77.7000 && lon < 77.7500) {
        return "Vannarpettai / Palayamkottai Area"; 
    }
    // Sankar Nagar / Pettai Area
    if (lat > 8.7000 && lat < 8.7200 && lon > 77.6500 && lon < 77.6800) {
        return "Sankar Nagar / Pettai Area";
    }
    // Madurai Test Area (The 9.9277, 78.1061 coordinates from your screenshot)
    if (lat > 9.9000 && lat < 9.9500 && lon > 78.0800 && lon < 78.1300) {
        return "Madurai Test Area (External)";
    }
    
    // Final Fallback: Display coordinates if location is unknown
    return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
}


// --- MapUpdater Component for Auto-Zoom ---
const MapUpdater = ({ incidentCoords, vehicleCoords, hospitalCoords }) => {
    const map = useMap();

    useEffect(() => {
        let coords = [];
        
        if (incidentCoords) coords.push(incidentCoords);
        if (vehicleCoords) coords.push(vehicleCoords);
        if (hospitalCoords) coords.push(hospitalCoords);
        
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        } 
     map.invalidateSize();
    }, [map, incidentCoords, vehicleCoords, hospitalCoords]);

    return null;
};


// -------------------------------------------------------------------------
// --- 🌟 NEW: FeedbackModal Component 🌟 ---
// -------------------------------------------------------------------------

const FeedbackModal = ({ incidentId, show, onClose, onSubmit, rating, setRating, comment, setComment, submissionStatus }) => {
    if (!show) return null;

    return (
        <div style={modalStyles.backdrop}>
            <div style={modalStyles.modal}>
                <h3 style={modalStyles.header}>How was your emergency experience?</h3>
                <p style={modalStyles.subheader}>Please rate the overall service for incident **#{incidentId.substring(0, 8)}**.</p>
                
                {/* Rating Stars */}
                <div style={modalStyles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            style={{
                                ...modalStyles.star,
                                color: star <= rating ? '#ffc107' : '#e4e5e9',
                            }}
                        >
                            ★
                        </span>
                    ))}
                </div>
                
                {/* Comment Box */}
                <textarea
                    style={modalStyles.textarea}
                    placeholder="Optional: Tell us what went well or what could be improved..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    maxLength="500"
                    disabled={submissionStatus === 'submitting' || submissionStatus === 'success' || submissionStatus === 'duplicate'}
                />

                <div style={modalStyles.actions}>
                    <button 
                        style={{...modalStyles.button, backgroundColor: '#6c757d'}} 
                        onClick={onClose}
                        disabled={submissionStatus === 'submitting'}
                    >
                        {submissionStatus === 'success' || submissionStatus === 'duplicate' ? 'Close' : 'Skip'}
                    </button>
                    <button 
                        style={{...modalStyles.button, backgroundColor: '#007bff'}} 
                        onClick={onSubmit}
                        disabled={rating === 0 || submissionStatus === 'submitting' || submissionStatus === 'success' || submissionStatus === 'duplicate'}
                    >
                        {submissionStatus === 'submitting' ? 'Submitting...' : submissionStatus === 'success' || submissionStatus === 'duplicate' ? 'Submitted!' : 'Submit Feedback'}
                    </button>
                </div>
                
                {/* Status Messages - UPDATED LOGIC HERE */}
                {submissionStatus === 'error' && <p style={modalStyles.errorMessage}>Error submitting feedback. Please try again.</p>}
                {submissionStatus === 'success' && <p style={modalStyles.successMessage}>Thank you for your feedback!</p>}
                {submissionStatus === 'duplicate' && <p style={modalStyles.successMessage}>Feedback for this incident has already been recorded. Thank you!</p>}
            </div>
        </div>
    );
};


// -------------------------------------------------------------------------
// --- TrackingPage Main Component ---
// -------------------------------------------------------------------------
const TrackingPage = () => {
    const { incidentId } = useParams();
    const [incidentData, setIncidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State to hold the dynamic ETA countdown
    const [mockETA, setMockETA] = useState(null); 
    // State to hold the Geocoded Address
    const [incidentAddress, setIncidentAddress] = useState('Fetching address...');

    // 🌟 NEW: Feedback Modal State 🌟
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState(0); // 0 to 5
    const [comment, setComment] = useState('');
    // submissionStatus can now be: null, 'submitting', 'success', 'error', 'duplicate'
    const [submissionStatus, setSubmissionStatus] = useState(null); 


    const fetchIncident = useCallback(async () => {
    if (!incidentId || incidentId === 'undefined') return;
        try {
            const res = await axios.get(`${API_URL}/incident/${incidentId}`); 
            const data = res.data;
            setIncidentData(data);
            
            // 1. Geocode Location
            if (data.location?.coordinates) {
                const lat = data.location.coordinates[1];
                const lon = data.location.coordinates[0];
                setIncidentAddress(reverseGeocodeMock(lat, lon));
            }
            
            // 2. ETA Countdown Logic
           setMockETA(prevMockETA => {
        // Start the timer if it's currently null and status is moving
        if ((data.status === 'Dispatched' || data.status === 'En Route') && prevMockETA === null) {
            return Math.ceil(data.initialETA || 0);
        } 
        // Force to 0 if the vehicle has reached the location
        if (data.status === 'Arrived' || data.status === 'Completed' || data.status === 'On Scene') {
            return 0;
        }
        return prevMockETA;
    });

        } catch (err) {
            setError('Could not load incident tracking data. Check server connection.');
        } finally {
            setLoading(false);
        }
    }, [incidentId]);

    // Initial Fetch and Polling
    // --- FIND THIS BLOCK (Approx Line 194) ---
useEffect(() => {
    // 🚨 CHANGE THIS LINE: Add the check for 'undefined' string
    if (!incidentId || incidentId === 'undefined') {
        setError('Tracking ID is not ready. Please wait...');
        return;
    }

    fetchIncident();
    const interval = setInterval(fetchIncident, 3000); 
    return () => clearInterval(interval);
}, [incidentId, fetchIncident]);
    // ETA Countdown Timer
    useEffect(() => {
        if (mockETA > 0) {
            const countdown = setInterval(() => {
                setMockETA(prevETA => {
                    const nextETA = prevETA - 1;
                    return nextETA > 0 ? nextETA : 0; 
                }); 
            }, 60000); // Decrement every minute (60 seconds)
            
            return () => clearInterval(countdown);
        }
    }, [mockETA]);


    // 🌟 NEW: Auto-Trigger Feedback Modal on 'Completed' 🌟
   // --- FIND THIS BLOCK IN YOUR TrackingPage.jsx (Approx Line 227) ---
useEffect(() => {
    let arrivalTimer;

    // Condition A: If vehicle arrives, start a 60s countdown to force completion
    if (incidentData?.status === 'Arrived' && !showFeedbackModal) {
        console.log("Vehicle arrived. Triggering completion in 60 seconds...");
        
        arrivalTimer = setTimeout(async () => {
            try {
                // ✅ FIX 1: Corrected URL to include /status
                await axios.put(`${API_URL}/incident/${incidentId}/status`, { 
                    status: 'Completed' 
                });
                
                setShowFeedbackModal(true);
            } catch (err) {
                console.error("Auto-complete sync failed", err);
            }
        }, 60000); // ✅ FIX 2: Set to 60 seconds (1 minute)
    }

    // Condition B: If backend already says 'Completed', show modal immediately
    if (incidentData?.status === 'Completed' && !showFeedbackModal && submissionStatus !== 'success') {
        setShowFeedbackModal(true);
    }

    return () => clearTimeout(arrivalTimer);
}, [incidentData?.status, incidentId, showFeedbackModal, submissionStatus]);


    // 🌟 UPDATED: Handle Feedback Submission to catch 409 Conflict 🌟
    const handleSubmitFeedback = async () => {
        if (rating === 0) return alert('Please select a star rating before submitting.');

        setSubmissionStatus('submitting');
        try {
            await axios.post(`${API_URL}/feedback`, {
                incidentId,
                rating,
                comment,
            });
            setSubmissionStatus('success');
        } catch (error) {
            console.error('Feedback submission failed:', error);
            
            // Check for the 409 Conflict status (meaning feedback already exists)
            if (error.response && error.response.status === 409) {
                // Treat 409 as a successful resolution for the user interface
                setSubmissionStatus('duplicate'); 
            } else {
                // For all other errors (500, 400, network error, etc.)
                setSubmissionStatus('error');
            }
        }
    };


    // Helper to extract Leaflet coordinates from GeoJSON [lon, lat] -> [lat, lon]
    const getCoords = useMemo(() => (data) => [data.coordinates[1], data.coordinates[0]], []);


    // --- Loading & Error Handling ---
    if (loading) return <div style={styles.center}><p>Loading Real-time Tracking Data...</p></div>;
    if (error) return <div style={styles.center}><p style={{color: '#dc3545', fontWeight: 'bold'}}>{error}</p></div>;
    
    if (!incidentData || !incidentData.location) return <div style={styles.center}><p>Incident data structure incomplete. Waiting for location details...</p></div>;


    // --- Data Processing (No Change) ---
    const incidentCoords = incidentData.location?.coordinates ? getCoords(incidentData.location) : null;
    const vehicleCoords = incidentData.assignedVehicle?.currentLocation?.coordinates ? getCoords(incidentData.assignedVehicle.currentLocation) : null;
    
    const hospitalCoords = incidentData.suggestedHospital?.location?.coordinates ? getCoords(incidentData.suggestedHospital.location) : null;
    const hospitalName = incidentData.suggestedHospital?.name || 'Nearest Hospital';
    
    if (!incidentCoords) return <div style={styles.center}><p>Incident location data missing from server.</p></div>;

    const center = vehicleCoords || incidentCoords || TIRUNELVELI_CENTER;
    
    let polyline = [];
    if (vehicleCoords && incidentCoords) {
        polyline = [vehicleCoords, incidentCoords];
    } else if (hospitalCoords && incidentCoords && incidentData.type === 'Medical' && incidentData.status === 'Reported') {
        polyline = [incidentCoords, hospitalCoords];
    }

    const distanceKm = vehicleCoords ? L.latLng(vehicleCoords).distanceTo(L.latLng(incidentCoords)) / 1000 : null;

    const statusSteps = ['Reported', 'Dispatched', 'En Route', 'Arrived', 'Completed']; 
const currentStatus = incidentData.status;

// 1. Get the base index from the database
let currentStepIndex = statusSteps.indexOf(currentStatus);

// 2. 🌟 THE FIX: Force the progress bar to 'Arrived' if the timer hits 0
// This ensures the green line moves even if the backend is slightly slow.
if ((currentStatus === 'Dispatched' || currentStatus === 'En Route') && mockETA === 0) {
    currentStepIndex = 3; // Index 3 is 'Arrived'
}

let vehicleOriginAddress = 'Unknown Origin';
if (vehicleCoords) {
    vehicleOriginAddress = reverseGeocodeMock(vehicleCoords[0], vehicleCoords[1]);
}

    // --- Render Component ---
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={{ marginBottom: '5px' }}>Tracking Incident <span style={{ color: '#007bff' }}>#{incidentId.substring(0, 8)}</span></h1>
                
                {/* Visual Status Bar (No Change) */}
                <div style={styles.statusBar}>
                    {statusSteps.map((step, index) => (
                        <React.Fragment key={step}>
                            <div style={{
                                ...styles.statusDot,
                                backgroundColor: index <= currentStepIndex ? '#28a745' : '#ccc'
                            }} />
                            <p style={{
                                ...styles.statusText,
                                color: index <= currentStepIndex ? '#333' : '#999'
                            }}>{step}</p>
                            {index < statusSteps.length - 1 && <div style={{
                                ...styles.statusLine, 
                                backgroundColor: index < currentStepIndex ? '#28a745' : '#ccc'
                            }} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Combined Information Row (No Change) */}
                <div style={styles.infoRow}>

                    {/* 1. 📍 User's Accident Location Box */}
                    {incidentCoords && (
                        <div style={styles.locationBox}>
                            <p style={styles.boxHeader}>
                                <span role="img" aria-label="location">📍</span> User's Location
                            </p>
                            <p style={styles.locationAddress}>
                                {incidentAddress}
                            </p>
                        </div>
                    )}
                    
                   {/* 2. 🚑 Vehicle Origin/Current Location Box */}
{incidentData.assignedVehicle && (
    <div style={styles.originBox}>
        <p style={styles.boxHeader}>
            <span role="img" aria-label="ambulance">🚑</span> Coming From
        </p>
        
        {/* Pulling the specific area name from your database */}
        <p style={styles.originAddress}>
            {incidentData.assignedVehicle.baseLocation || "Fetching Location..."}
        </p>

        <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '5px 0 0', fontWeight: '500' }}>
            ({incidentData.assignedVehicle.type} - {incidentData.assignedVehicle.vehicleID})
        </p>
    </div>
)}
                    
                    {/* 3. 🏥 Suggested Destination Box */}
                    {incidentData.type === 'Medical' && hospitalCoords && (
                        <div style={styles.hospitalBox}>
                            <p style={styles.boxHeader}>
                                <span role="img" aria-label="hospital">🏥</span> Destination Hospital
                            </p>
                            <p style={styles.hospitalName}>
                                {hospitalName}
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Prominent ETA Display (No Change) */}
{/* Prominent ETA Display */}
<div style={{ ...styles.etaBox, padding: 0, overflow: 'hidden' }}>
    {/* 1. Check if the vehicle is currently moving */}
    {(currentStatus === 'Dispatched' || currentStatus === 'En Route') ? (
        /* If moving, check the timer */
        mockETA > 0 ? (
            <>
                {/* Upper Section: Text and Time */}
                <div style={{ padding: '20px 20px 10px 20px' }}>
                    <p style={styles.etaText}>Estimated Time of Arrival (ETA)</p>
                    <span style={{ ...styles.etaTime, fontSize: '3.5rem', display: 'block' }}>{mockETA} Minutes</span>
                    
                    {incidentData.assignedVehicle && (
                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                            {incidentData.assignedVehicle.vehicleID} ({incidentData.assignedVehicle.type}) is {distanceKm ? distanceKm.toFixed(2) : '0'} km away.
                        </p>
                    )}
                </div>

                {/* --- DARK BOTTOM STRIP: Driver & Contact --- */}
                {incidentData.assignedVehicle && (
                    <div style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Creates the dark shaded look
                        padding: '12px 30px',
                        display: 'flex',
                        justifyContent: 'space-between', // Pushes Driver Left, Contact Right
                        alignItems: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span>Driver: {incidentData.assignedVehicle.driverName || 'Assigning...'}</span>
                        <span>Contact: {incidentData.assignedVehicle.contactNumber || 'Assigning...'}</span>
                    </div>
                )}
            </>
        ) : (
            /* 🌟 THE FIX: If timer is 0, show 'On site' immediately */
            <div style={{ padding: '30px' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}>
                    Vehicle is on site! 🚑
                </span>
            </div>
        )
    ) : (currentStatus === 'Arrived' || currentStatus === 'On Scene') ? (
        /* 2. Backend officially confirms arrival */
        <div style={{ padding: '30px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}>
                Vehicle is on site! 🚑
            </span>
        </div>
    ) : currentStatus === 'Completed' ? (
        <div style={{ padding: '30px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.8rem' }}>
                Incident Resolved ✅
            </span>
        </div>
    ) : (
        /* 3. Initial searching/reporting state */
        <div style={{ padding: '30px', textAlign: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.3rem' }}>
                {currentStatus === 'Reported' ? "Assigning nearest responder..." : "Updating system..."}
            </span>
        </div>
    )}
</div>
</div>

      {/* Replace your current mapWrapper block with this */}
<div style={styles.mapWrapper}>
    <MapContainer 
        center={center} 
        zoom={12} 
        style={styles.mapStyle}
        
        maxBounds={TIRUNELVELI_BOUNDS} 
        minZoom={10} 
    >
        <TileLayer url={TILE_LAYER_URL} attribution={TILE_LAYER_ATTRIB} />
        
        {/* Helper to keep map centered/zoomed on all markers */}
        <MapUpdater 
            incidentCoords={incidentCoords} 
            vehicleCoords={vehicleCoords} 
            hospitalCoords={hospitalCoords} 
        />

        {/* 1. EMERGENCY SITE MARKER (The User) */}
        {incidentCoords && (
            <Marker position={incidentCoords} icon={incidentIcon}>
                <Popup>
                    <strong>Emergency Site</strong><br/>
                    {incidentAddress}
                </Popup>
            </Marker>
        )}

        {/* 2. REAL-TIME RESPONDER VEHICLE MARKER */}
        {vehicleCoords && (
            <Marker position={vehicleCoords} icon={vehicleIcon}>
                <Popup>
                    <strong>Responder: {incidentData.assignedVehicle.vehicleID}</strong><br/>
                    Status: {incidentData.status}
                </Popup>
            </Marker>
        )}

        {/* 3. HOSPITAL MARKER (If medical) */}
        {hospitalCoords && (
            <Marker position={hospitalCoords} icon={hospitalIcon}>
                <Popup>Destination: {hospitalName}</Popup>
            </Marker>
        )}

        {/* 4. DASHED LINE CONNECTING THEM */}
        {polyline.length > 1 && (
            <Polyline 
                pathOptions={{ color: '#007bff', weight: 4, dashArray: '10, 10' }} 
                positions={polyline} 
            />
        )}
    </MapContainer>
</div>
            
            {/* 🌟 NEW: Render Feedback Modal 🌟 */}
            <FeedbackModal 
                incidentId={incidentId}
                show={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={handleSubmitFeedback}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                submissionStatus={submissionStatus}
            />

        </div>
    );
};

// --- Modal Styles (Updated to include successMessage for 'duplicate' status) ---
const modalStyles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        maxWidth: '450px',
        width: '90%',
        textAlign: 'center',
    },
    header: {
        margin: '0 0 10px 0',
        color: '#007bff',
        fontSize: '1.8em',
    },
    subheader: {
        margin: '0 0 20px 0',
        color: '#6c757d',
    },
    starsContainer: {
        marginBottom: '20px',
        fontSize: '3em',
        cursor: 'pointer',
    },
    star: {
        margin: '0 5px',
        transition: 'color 0.2s',
        WebkitTextStroke: '1px #ffc107', // Outline for better contrast
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginBottom: '20px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        resize: 'none',
        boxSizing: 'border-box',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '10px',
    },
    button: {
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flex: 1,
    },
    errorMessage: {
        color: '#dc3545',
        marginTop: '15px',
        fontWeight: 'bold',
    },
    successMessage: {
        color: '#28a745',
        marginTop: '15px',
        fontWeight: 'bold',
    }
};

// --- Existing Tracking Page Styles (No Change) ---
const styles = {
    // ... (Your existing styles here) ...
    container: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        fontFamily: 'Roboto, sans-serif',
        padding: '20px',
        maxWidth: '850px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa'
    },
    header: {
        textAlign: 'center',
        paddingBottom: '20px',
        marginBottom: '10px',
        borderBottom: '2px solid #eee',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        marginBottom: '15px',
        flexWrap: 'wrap',
    },
    boxHeader: {
        fontSize: '0.9em',
        color: '#333',
        margin: '0 0 5px 0',
        fontWeight: 'bold',
    },
    locationBox: {
        flex: '1 1 30%', 
        backgroundColor: '#fffbe6', // Light Yellow
        color: '#8a6d3b',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #faebcc',
        minWidth: '200px',
    },
    locationAddress: {
        fontSize: '1.1em',
        margin: 0,
    },
    originBox: {
        flex: '1 1 30%',
        backgroundColor: '#e8f3ff', // Light Blue
        color: '#004085',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #cce5ff',
        minWidth: '200px',
    },
    originAddress: {
        fontSize: '1.1em',
        margin: 0,
    },
    hospitalBox: {
        flex: '1 1 30%',
        backgroundColor: '#e6ffed',
        color: '#155724',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        minWidth: '200px',
    },
    hospitalName: {
        fontWeight: 'bold',
        textDecoration: 'underline',
        display: 'block',
        fontSize: '1.1em',
        margin: 0,
    },
    etaBox: {
        backgroundColor: '#dc3545', // Danger Red for high visibility
        color: 'white',
        padding: '15px 10px',
        borderRadius: '8px',
        marginTop: '15px',
        marginBottom: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
    etaText: {
        margin: '0',
        fontSize: '1em',
        fontWeight: 'normal',
    },
    etaTime: {
        fontSize: '2.5em',
        fontWeight: 'bold',
        display: 'block',
        lineHeight: '1.2',
    },
    statusBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '20px 0',
        padding: '0 10px',
    },
    statusDot: {
        width: '15px',
        height: '15px',
        borderRadius: '50%',
        backgroundColor: '#ccc',
    },
    statusLine: {
        flexGrow: 1,
        height: '4px',
        backgroundColor: '#ccc',
        margin: '0 5px',
    },
    statusText: {
        fontSize: '0.85em',
        fontWeight: 'bold',
        minWidth: '50px',
        textAlign: 'center',
        margin: '0',
    },
    mapWrapper: {
        flexGrow: 1, 
        minHeight: '500px', 
        marginTop: '15px',
        borderRadius: '15px', 
        overflow: 'hidden', 
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        position: 'relative', // Add this
        width: '100%',
    },
    mapStyle: {
        height: '450px',
        width: '100%',
    },
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
};

export default TrackingPage;