// client/src/pages/SplashScreen.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TnGovtLogo from '../assets/tn_emblem.png'; 

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/home'), 4000); 
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={styles.container}>
            {/* Pulsing Background Glow */}
            <motion.div 
                style={styles.glow}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={styles.content}
            >
                <img src={TnGovtLogo} alt="Emblem" style={styles.logo} />
                <h1 style={styles.title}>NELLAI RESQ</h1>
                <p style={styles.subtitle}>Assured Service • Speed • Protection</p>
                
                <div style={styles.loaderBar}>
                    <motion.div 
                        style={styles.progress}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5 }}
                    />
                </div>
            </motion.div>

            <button onClick={() => navigate('/home')} style={styles.skipBtn}>Skip ➔</button>
        </div>
    );
};

const styles = {
    container: { height: '100vh', backgroundColor: '#001a33', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', overflow: 'hidden', position: 'relative' },
    glow: { position: 'absolute', width: '400px', height: '400px', background: '#007bff', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 },
    content: { textAlign: 'center', zIndex: 1 },
    logo: { width: '120px', marginBottom: '20px' },
    title: { fontSize: '3rem', letterSpacing: '10px', fontWeight: 'bold', margin: '10px 0' },
    subtitle: { fontSize: '1.1rem', color: '#80b3ff', marginBottom: '30px' },
    loaderBar: { width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', margin: '0 auto', overflow: 'hidden' },
    progress: { height: '100%', background: '#007bff' },
    skipBtn: { position: 'absolute', bottom: '30px', right: '30px', background: 'none', border: '1px solid #fff', color: '#fff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }
};

export default SplashScreen;