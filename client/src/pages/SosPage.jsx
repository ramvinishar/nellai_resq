import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
const ACCURACY_THRESHOLD = 500;

const SosPage = () => {
    const [incidentType, setIncidentType] = useState('Medical');
    const [location, setLocation] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Fetching precise location...');
    const [isReady, setIsReady] = useState(false);
    
    // --- GRACE PERIOD & CANCELLATION STATES ---
    const [countdown, setCountdown] = useState(null); 
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const navigate = useNavigate();
    const socketRef = useRef(null);
    const timerRef = useRef(null);

    

    // 1. Socket Connection Setup
    useEffect(() => {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, []);

    // 2. Geolocation Logic
    useEffect(() => {
        if (!navigator.geolocation) {
            setStatusMessage('🚨 Geolocation is NOT supported.');
            return;
        }
        const success = (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const isAccurate = accuracy < ACCURACY_THRESHOLD;
            setLocation({ lat: latitude, lon: longitude, accuracy: accuracy });
            if (isAccurate) {
                setStatusMessage(`Location found (±${accuracy.toFixed(0)}m). Ready to report.`);
                setIsReady(true);
            } else {
                setStatusMessage(`Fetching precise location... (±${accuracy.toFixed(0)}m)`);
                setIsReady(false);
            }
        };
        const error = () => {
            setIsReady(false);
            setStatusMessage('🚨 Could not get location.');
        };
        const watcherId = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        });
        return () => navigator.geolocation.clearWatch(watcherId);
    }, []);

    // 3. Grace Period Timer Logic
    useEffect(() => {
        if (countdown === 0) {
            executeActualSOS(); 
            setCountdown(null);
        }
        if (countdown === null) return;

        timerRef.current = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timerRef.current);
    }, [countdown]);

    const startGracePeriod = () => {
        if (!isReady || !location) {
            alert('Cannot send SOS. Location is not precise enough.');
            return;
        }
        setCountdown(5); 
    };

    const handleCancel = () => {
        clearTimeout(timerRef.current);
        setCountdown(null);
        setShowReasonModal(true); 
    };

    const submitCancellationReason = () => {
        console.log("SOS Cancelled. Reason:", cancelReason);
        setShowReasonModal(false);
        setCancelReason('');
        setStatusMessage("SOS Aborted. Ready to report again.");
    };

    // 4. Actual SOS Execution
    const executeActualSOS = async () => {
        setStatusMessage('Sending SOS... Alerting nearest Driver.');
        try {
            const incidentPayload = {
                incidentType,
                userLocation: {
                    type: "Point",
                    coordinates: [location.lon, location.lat] 
                },
                accuracy: location.accuracy 
            };
            
            const res = await axios.post(`${API_URL}/sos`, incidentPayload);
            const fullIncidentData = res.data.incident; 

            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('new_emergency_sos', fullIncidentData);
                console.log("Dispatch signal sent to driver room.");
            }

            navigate(`/track/${res.data.incidentId}`);
        } catch (err) {
            setStatusMessage(`Error: ${err.response?.data?.message || 'Failed to dispatch.'}`);
            setCountdown(null);
        }
    };

    return (
        <div style={styles.outerContainer}>
            {/* GRACE PERIOD OVERLAY */}
            {countdown !== null && (
                <div style={styles.overlay}>
                    <div style={styles.countdownCircle}>
                        <h1 style={styles.countdownNumber}>{countdown}</h1>
                    </div>
                    <h2 style={{ color: 'white' }}>Sourcing Emergency Help...</h2>
                    <button onClick={handleCancel} style={styles.cancelBtn}>
                        STOP / CANCEL SOS
                    </button>
                    <p style={{ color: 'white', marginTop: '20px' }}>Dispatching in {countdown} seconds</p>
                </div>
            )}

            {/* REASON FOR CANCELLATION MODAL */}
            {showReasonModal && (
                <div style={styles.modalBackdrop}>
                    <div style={styles.modalContent}>
                        <h3>Why was this SOS cancelled?</h3>
                        <p style={{fontSize: '0.9em', color: '#666'}}>Help us prevent false alarms.</p>
                        <select 
                            style={styles.selectStyle} 
                            value={cancelReason} 
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            <option value="">-- Select a Reason --</option>
                            <option value="Accidental Click">Accidental Click</option>
                            <option value="Child/Others playing">Child/Others playing</option>
                            <option value="Emergency Resolved">Emergency Resolved</option>
                            <option value="Testing">Just Testing</option>
                        </select>
                        <button 
                            onClick={submitCancellationReason} 
                            style={styles.submitReasonBtn}
                            disabled={!cancelReason}
                        >
                            Submit & Close
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN SOS PAGE CONTENT */}
            <h1 style={{ color: '#dc3545', margin: '10px 0' }}>🚨 Immediate SOS Report 🚨</h1>
            <div style={styles.formContainer}>
                <p style={{ color: isReady ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                    Status: {statusMessage}
                </p>
                <h3 style={{ margin: '20px 0 10px 0' }}>Emergency Type:</h3>
                <select 
                    value={incidentType} 
                    onChange={(e) => setIncidentType(e.target.value)}
                    style={styles.selectStyle}
                    disabled={!isReady || countdown !== null}
                >
                    <option value="Medical">Medical Emergency (Accident)</option>
                    <option value="Fire">Fire Incident (Fire Service)</option>
                    <option value="Other">Other Emergency (Police)</option>
                </select>
                <button 
                    onClick={startGracePeriod} 
                    style={isReady ? styles.sosButton : styles.disabledButton}
                    disabled={!isReady || countdown !== null}
                >
                    {isReady ? 'TAP TO SEND SOS' : 'AWAITING LOCATION...'}
                </button>
            </div>
            <button onClick={() => navigate('/')} style={styles.backButton}>Back to Home</button>
        </div>
    );
};

// --- CORRECTED STYLES OBJECT ---
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(220, 53, 69, 0.98)',
        zIndex: 1000, // Fixed: camelCase zIndex
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    countdownCircle: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        border: '8px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '30px'
    },
    countdownNumber: { 
        color: 'white', 
        fontSize: '4em', 
        margin: 0 
    },
    cancelBtn: {
        padding: '20px 40px',
        backgroundColor: 'white',
        color: '#dc3545',
        border: 'none',
        borderRadius: '50px',
        fontSize: '1.5em',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    },
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 2000, // Fixed: camelCase zIndex
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        width: '85%',
        maxWidth: '400px',
        textAlign: 'center'
    },
    submitReasonBtn: {
        marginTop: '20px',
        padding: '12px',
        width: '100%',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    sosButton: { 
        padding: '25px 40px',
        marginTop: '20px', 
        backgroundColor: '#dc3545', 
        color: 'white', 
        cursor: 'pointer', 
        width: '100%', 
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.4em',
        fontWeight: 'bold',
    },
    outerContainer: { textAlign: 'center', padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffbe6' },
    formContainer: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '90%', maxWidth: '450px', margin: '20px 0' },
    selectStyle: { padding: '15px', margin: '15px 0', borderRadius: '8px', width: '100%', fontSize: '1.1em', border: '1px solid #ccc' },
    backButton: { marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    disabledButton: { padding: '25px 40px', marginTop: '20px', backgroundColor: '#f8d7da', color: '#721c24', width: '100%', border: 'none', borderRadius: '10px', fontSize: '1.4em', fontWeight: 'bold', cursor: 'not-allowed' },
};

export default SosPage;