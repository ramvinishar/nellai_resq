import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
    FaUserShield, FaAmbulance, FaFireExtinguisher, 
    FaCheckCircle, FaMapMarkerAlt, FaIdCard 
} from 'react-icons/fa';

// Ensure this file exists in your client/src/assets folder
import heroIllustration from '../assets/about1.png'; 

const UserProfilePage = () => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    
    const [heroes, setHeroes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHeroes = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/heroes');
                if (!response.ok) throw new Error("Backend Route Not Found");
                const data = await response.json();
                setHeroes(data);
            } catch (error) {
                console.error("Error fetching heroes, using mock data:", error);
                // Fallback Mock Data matching your DB format
                setHeroes([
                    { 
                        driverName: "Ravi Kumar", 
                        vehicleID: "A002", 
                        type: "Ambulance", 
                        baseLocation: "Vannarpettai Area",
                        status: "Available"
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHeroes();
    }, []);

    const styles = useMemo(() => ({
        container: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
        headerHero: {
            background: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url(${heroIllustration})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            padding: '80px 20px', color: 'white', textAlign: 'center'
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px', maxWidth: '1200px', margin: '40px auto', padding: '0 20px 80px'
        },
        card: {
            backgroundColor: 'white', borderRadius: '24px', padding: '35px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
            transition: 'transform 0.2s ease-in-out', textAlign: 'left'
        },
        label: { color: '#64748b', fontWeight: 600, fontSize: '0.9rem' },
        value: { color: '#1e293b', fontWeight: 700, fontSize: '1rem' },
        iconBox: {
            width: '60px', height: '60px', borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', marginBottom: '20px'
        }
    }), []);

    const getTheme = (type) => {
        const t = type?.toLowerCase();
        if (t === 'police') return { icon: <FaUserShield />, color: '#1e40af', bg: '#dbeafe' };
        if (t === 'fire' || t === 'fire service') return { icon: <FaFireExtinguisher />, color: '#b91c1c', bg: '#fee2e2' };
        return { icon: <FaAmbulance />, color: '#047857', bg: '#d1fae5' };
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <div style={styles.headerHero}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '15px' }}>
                    {isEn ? "Guardians of Nellai" : "நெல்லையின் பாதுகாவலர்கள்"}
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
                    {isEn 
                        ? "Recognizing the dedicated drivers and responders serving our city 24/7." 
                        : "எங்கள் நகரத்திற்கு 24/7 சேவை செய்யும் அர்ப்பணிப்புள்ள ஓட்டுநர்கள் மற்றும் பதிலளிப்பவர்களை அங்கீகரிக்கிறோம்."}
                </p>
            </div>

            {/* Heroes Grid */}
            <div style={styles.grid}>
                {heroes.map((hero, index) => {
                    const theme = getTheme(hero.type);
                    return (
                        <div key={index} style={styles.card} className="hero-card">
                            <div style={{ ...styles.iconBox, backgroundColor: theme.bg, color: theme.color }}>
                                {theme.icon}
                            </div>
                            
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#0f172a' }}>
                                {hero.driverName}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={styles.label}><FaIdCard /> {isEn ? "Vehicle ID:" : "வாகன ஐடி:"}</span>
                                    <span style={styles.value}>{hero.vehicleID}</span>
                                </div>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={styles.label}><FaUserShield /> {isEn ? "Unit Type:" : "பிரிவு வகை:"}</span>
                                    <span style={styles.value}>{isEn ? hero.type : (hero.type === 'Ambulance' ? 'ஆம்புலன்ஸ்' : hero.type)}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    <span style={styles.label}><FaMapMarkerAlt /> {isEn ? "Service Area:" : "சேவை பகுதி:"}</span>
                                    <span style={{ ...styles.value, fontSize: '0.85rem', textAlign: 'right', maxWidth: '150px' }}>
                                        {hero.baseLocation}
                                    </span>
                                </div>
                            </div>

                            <div style={{ 
                                marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', 
                                color: '#10b981', fontWeight: 800, fontSize: '0.9rem' 
                            }}>
                                <FaCheckCircle /> {isEn ? "ON ACTIVE DUTY" : "தற்போது பணியில்"}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserProfilePage;