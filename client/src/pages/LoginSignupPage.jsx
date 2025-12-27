import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaAmbulance, FaLock, FaUserPlus, FaChevronRight } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const LoginSignupPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'Responder', // Default role
        vehicleId: ''      // Only needed for Responders
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const endpoint = isLogin ? '/login' : '/register';

        try {
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            
            if (isLogin) {
                const { username, role, vehicleId } = res.data.user;
                // Store session info
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('role', role);
                localStorage.setItem('username', username); 
            
            // ✅ BEST PRACTICE: Save the whole user object as a string
            localStorage.setItem('user', JSON.stringify(res.data.user))

                // Role-Based Navigation
                if (role === 'Dispatcher') {
                    navigate('/dispatch');
                } else {
                    navigate(`/responder/${vehicleId || formData.username}`);
                }
            } else {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Toggle Header */}
                <div style={styles.toggleRow}>
                    <button 
                        onClick={() => setIsLogin(true)} 
                        style={{...styles.toggleTab, borderBottom: isLogin ? '3px solid #0056b3' : 'none', color: isLogin ? '#0056b3' : '#888'}}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)} 
                        style={{...styles.toggleTab, borderBottom: !isLogin ? '3px solid #0056b3' : 'none', color: !isLogin ? '#0056b3' : '#888'}}
                    >
                        Register Staff
                    </button>
                </div>

               

                <h2 style={styles.title}>{isLogin ? 'Staff Login' : 'Staff Registration'}</h2>
                <p style={styles.subtitle}>Nellai ResQ Official Emergency Portal</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && <div style={styles.error}>{error}</div>}

                    {/* Role Selection */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Official Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
                            <option value="Responder">Emergency Responder (Driver)</option>
                            <option value="Dispatcher">Dispatch Center (Admin)</option>
                        </select>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Badge Number / Username</label>
                        <input 
                            name="username"
                            type="text" 
                            placeholder="e.g. OFFICER_742" 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                        />
                    </div>

                    {/* Show Vehicle ID input only for Responders during Registration */}
                    {!isLogin && formData.role === 'Responder' && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Assigned Vehicle ID</label>
                            <input 
                                name="vehicleId"
                                type="text" 
                                placeholder="e.g. AMB-NELLAI-01" 
                                onChange={handleChange} 
                                style={styles.input} 
                                required 
                            />
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Security Password</label>
                        <input 
                            name="password"
                            type="password" 
                            placeholder="Enter unique password" 
                            onChange={handleChange} 
                            style={styles.input} 
                            required 
                        />
                    </div>

                    <button type="submit" disabled={isLoading} style={styles.submitBtn}>
                        {isLoading ? 'Processing...' : (isLogin ? 'Authorize Access' : 'Create Account')}
                        <FaChevronRight style={{marginLeft: '10px'}} />
                    </button>
                </form>

                <button onClick={() => navigate('/home')} style={styles.backLink}>
                    Return to Public Homepage
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#cbdef4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5px' },
    card: { background: '#fff', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center' },
    toggleRow: { display: 'flex', marginBottom: '30px', borderBottom: '1px solid #eee' },
    toggleTab: { flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
    
    title: { margin: '0', color: '#333' },
    subtitle: { color: '#888', fontSize: '0.85rem', marginBottom: '25px' },
    inputGroup: { textAlign: 'left', marginBottom: '15px' },
    label: { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', color: '#555' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '14px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' },
    error: { background: '#fee', color: '#c00', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.85rem' },
    backLink: { background: 'none', border: 'none', color: '#0056b3', marginTop: '20px', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }
};

export default LoginSignupPage;