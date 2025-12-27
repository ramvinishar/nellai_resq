// client/src/pages/HomePage.jsx (UPDATED - Stats moved down)

import React, { useMemo, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaFire, FaAmbulance, FaShieldAlt, FaMapMarkedAlt, 
    FaChartLine, FaQuoteLeft, FaStar, FaUserCircle, FaCheckCircle 
} from 'react-icons/fa';
import heroBackgroundImage from '../assets/emergency_bg.jpg'; 

const MOCK_STATS = [
    { value: '12,345+', labelEn: 'Incidents Handled', labelTa: 'கையாளப்பட்ட நிகழ்வுகள்', icon: FaChartLine, color: '#007bff' },
    { value: '5.7 Mins', labelEn: 'Avg. Response Time', labelTa: 'சராசரி பதில் நேரம்', icon: FaAmbulance, color: '#28a745' },
    { value: '12', labelEn: 'Live Incidents Now', labelTa: 'தற்போதைய நிகழ்வுகள்', icon: FaFire, color: '#dc3545' },
];

const HomePage = () => {
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    
    const navigate = useNavigate();
    const [feedbackList, setFeedbackList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/feedback');
                const data = await response.json();
                setFeedbackList(data.slice(0, 3)); 
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const handleCallForHelp = () => navigate('/sos');

    const styles = useMemo(() => ({
        container: {
            fontFamily: "'Inter', 'Roboto', sans-serif",
            textAlign: 'center',
            backgroundColor: '#f4f7f6',
            margin: 0,
            overflowX: 'hidden'
        },
        
       tickerContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#fff3cd', // Warning light yellow
    borderBottom: '2px solid #FF9933', // Official Saffron
    padding: '10px 0',
},
scrollWrapper: {
    display: 'flex',
    width: 'max-content', // Important: fit both copies side-by-side
    animation: 'continuousScroll 40s linear infinite',
},
tickerContent: {
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    paddingRight: '50px', // Spacing between the end of one and start of next
    color: '#333',
},

        heroSection: {
            background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroBackgroundImage})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '88px 20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        },

        heroTitle: {
            fontSize: '4rem',
            margin: '0 0 15px 0',
            fontWeight: 900,
            letterSpacing: '-2px',
            textShadow: '2px 2px 10px rgba(0,0,0,0.3)'
        },
        resqHighlight: {
            color: '#ef4444'
        },
        heroTagline: {
            fontSize: '1.4rem',
            fontWeight: 300,
            maxWidth: '750px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
            color: '#cbd5e1'
        },
        ctaButton: {
            fontSize: '1.4rem',
            padding: '20px 50px',
            borderRadius: '100px',
            border: 'none',
            backgroundColor: '#dc3545',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(220, 53, 69, 0.5)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        },
        statsRow: {
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '25px',
            padding: '0 20px',
            marginTop: '40px', 
            position: 'relative',
            zIndex: 20,
        },
        statBox: {
            flex: '1 1 280px',
            maxWidth: '320px',
            padding: '35px 20px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
            transition: 'transform 0.3s ease',
            borderBottom: '5px solid'
        },
        statValue: {
            fontSize: '2.8rem',
            fontWeight: 800,
            margin: '10px 0',
            letterSpacing: '-1px'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1.5px'
        },
        featuresSection: {
            padding: '80px 20px',
            backgroundColor: '#f8fafc',
        },
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            maxWidth: '1200px',
            margin: '50px auto 0',
        },
        featureItem: {
            textAlign: 'left',
            padding: '45px 35px',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            border: '1px solid #f1f5f9'
        },
        featureIcon: {
            fontSize: '2.5rem',
            marginBottom: '20px',
            display: 'block'
        },
        feedbackSection: {
            padding: '100px 20px',
            backgroundColor: '#0f172a', 
            color: 'white',
            backgroundImage: 'radial-gradient(circle at top right, #1e293b, #0f172a)'
        },
        feedbackGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '50px auto 0',
        },
        feedbackCard: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            padding: '40px',
            borderRadius: '28px',
            textAlign: 'left',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
        },
        quoteIcon: {
            position: 'absolute',
            top: '30px',
            right: '30px',
            fontSize: '3rem',
            color: 'rgba(255,255,255,0.05)'
        },
        ratingStars: {
            color: '#fbbf24',
            fontSize: '1.1rem',
            marginBottom: '20px',
            display: 'flex',
            gap: '4px'
        },
        verifiedBadge: {
            color: '#4ade80',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            borderRadius: '50px',
            marginTop: '20px'
        },
        globalStyles: `
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                70% { transform: scale(1.03); box-shadow: 0 0 0 20px rgba(220, 53, 69, 0); }
                100% { transform: scale(1); }
            }
             @keyframes continuousScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
}
            .feature-card:hover { 
                transform: translateY(-12px); 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
                border-color: #3b82f6 !important;
            }
            .stat-box:hover { transform: translateY(-10px); }
        `,
    }), []);

    return (
        <div style={styles.container}>
            <style>{styles.globalStyles}</style>
            
            <div style={styles.tickerContainer}>
    <div style={styles.scrollWrapper}>
        {/* First Copy */}
        <div style={styles.tickerContent}>
            ⚠️ {isEn ? 'NOTICE' : 'அறிவிப்பு'}: {isEn 
                ? ' Nellai ResQ is now live. Track real-time locations of Ambulances, Fire Services, and Police units for immediate emergency assistance. Our ResQ Heroes are on duty 24/7. ⚠️ Do not misuse the SOS button. False alarms or prank calls are punishable offenses under law.' 
                : ' நெல்லை ரெஸ்க்யூ நேரலையில் உள்ளது. உடனடி அவசர உதவிக்கு ஆம்புலன்ஸ், தீயணைப்பு மற்றும் காவல் வாகனங்களின் இருப்பிடங்களை நேரலையில் கண்காணிக்கலாம். எங்களது மீட்பு வீரர்கள் 24/7 பணியில் உள்ளனர். ⚠️அவசர கால (SOS) பொத்தானை தவறாக பயன்படுத்தாதீர்கள். தவறான தகவல்களை பரப்புவது சட்டப்படி தண்டனைக்குரிய குற்றமாகும்.'}
            &nbsp;&nbsp;&nbsp;&nbsp; {/* Large space between repetitions */}
        </div>

        {/* Second Identical Copy for Seamless Loop */}
        <div style={styles.tickerContent}>
            ⚠️ {isEn ? 'NOTICE' : 'அறிவிப்பு'}: {isEn 
                ? ' Nellai ResQ is now live. Track real-time locations of Ambulances, Fire Services, and Police units for immediate emergency assistance. Our ResQ Heroes are on duty 24/7. ⚠️ Do not misuse the SOS button. False alarms or prank calls are punishable offenses under law.' 
                : ' நெல்லை ரெஸ்க்யூ நேரலையில் உள்ளது. உடனடி அவசர உதவிக்கு ஆம்புலன்ஸ், தீயணைப்பு மற்றும் காவல் வாகனங்களின் இருப்பிடங்களை நேரலையில் கண்காணிக்கலாம். எங்களது மீட்பு வீரர்கள் 24/7 பணியில் உள்ளனர். ⚠️அவசர கால (SOS) பொத்தானை தவறாக பயன்படுத்தாதீர்கள். தவறான தகவல்களை பரப்புவது சட்டப்படி தண்டனைக்குரிய குற்றமாகும்.'}
            &nbsp;&nbsp;&nbsp;&nbsp;
        </div>
    </div>
</div>
            

            {/* 2. HERO SECTION */}
            <div style={styles.heroSection}>
                <h1 style={styles.heroTitle}>
                    Nellai <span style={styles.resqHighlight}>ResQ</span>
                </h1>
                <h2 style={styles.heroTagline}>
                    {t('govt_tagline')} — {isEn ? 'Professional Emergency Management.' : 'தொழில்முறை அவசரகால மேலாண்மை.'}
                </h2>
                
                <button 
                    style={{...styles.ctaButton, animation: 'pulse 2s infinite'}} 
                    onClick={handleCallForHelp}
                >
                    <FaAmbulance size={30} /> 
                    {t('call_for_emergency_help')}
                </button>
            </div>

            {/* 3. STATS ROW */}
            <div style={styles.statsRow}>
                {MOCK_STATS.map((stat) => (
                    <div key={stat.labelEn} style={{...styles.statBox, borderBottomColor: stat.color}} className="stat-box">
                        <stat.icon style={{ ...styles.featureIcon, color: stat.color }} />
                        <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
                        <p style={styles.statLabel}>{isEn ? stat.labelEn : stat.labelTa}</p>
                    </div>
                ))}
            </div>

            {/* 4. FEATURES SECTION */}
            <div style={styles.featuresSection}>
                <h2 style={{ fontSize: '2.8rem', color: '#1e293b', fontWeight: 800, marginBottom: '15px' }}>
                    {isEn ? 'Advanced Response Features' : 'மேம்பட்ட பதிலளிப்பு அம்சங்கள்'}
                </h2>
                <div style={{ width: '80px', height: '5px', backgroundColor: '#3b82f6', margin: '0 auto 50px', borderRadius: '10px' }}></div>
                <div style={styles.featuresGrid}>
                    <div style={styles.featureItem} className="feature-card">
                        <FaMapMarkedAlt style={{ ...styles.featureIcon, color: '#10b981' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                            {isEn ? 'Geo-Smart Dispatch' : 'ஜியோ-ஸ்மார்ட் ஒதுக்கீடு'}
                        </h3>
                        <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                            {isEn 
                                ? 'AI automatically identifies the nearest vehicle for immediate dispatch to your GPS coordinates.'
                                : 'உங்கள் ஜிபிஎஸ் இருப்பிடத்திற்கு அருகிலுள்ள வாகனத்தை AI தானாகவே கண்டறிந்து உடனடியாக அனுப்பி வைக்கும்.'}
                        </p>
                    </div>
                    <div style={styles.featureItem} className="feature-card">
                        <FaChartLine style={{ ...styles.featureIcon, color: '#3b82f6' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                            {isEn ? 'Live Tracking & ETA' : 'நேரடி கண்காணிப்பு & வருகை நேரம்'}
                        </h3>
                        <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                            {isEn 
                                ? 'Monitor the assigned vehicle in real-time with precise arrival countdowns.'
                                : 'ஒதுக்கப்பட்ட வாகனத்தை துல்லியமான வருகை நேரத்துடன் நேரலையில் கண்காணிக்கவும்.'}
                        </p>
                    </div>
                    <div style={styles.featureItem} className="feature-card">
                        <FaShieldAlt style={{ ...styles.featureIcon, color: '#f43f5e' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                            {isEn ? 'Secure & Trustworthy' : 'பாதுகாப்பானது & நம்பகமானது'}
                        </h3>
                        <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                            {isEn 
                                ? 'Government-backed protocols ensuring your data is private and help is official.'
                                : 'உங்கள் தரவு தனிப்பட்டதாகவும், உதவி அதிகாரப்பூர்வமாகவும் இருப்பதை உறுதி செய்யும் அரசு நெறிமுறைகள்.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 5. FEEDBACK SECTION */}
            <div style={styles.feedbackSection}>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '15px' }}>
                    {isEn ? 'Voices of Citizens' : 'மக்களின் குரல்'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '50px' }}>
                    {isEn ? 'Real feedback from the people of Tirunelveli' : 'திருநெல்வேலி மக்களின் உண்மையான கருத்துக்கள்'}
                </p>
                
                {isLoading ? (
                    <p>{isEn ? 'Fetching community responses...' : 'சமூக பதில்களைப் பெறுகிறது...'}</p>
                ) : feedbackList.length > 0 ? (
                    <div style={styles.feedbackGrid}>
                        {feedbackList.map((item) => (
                            <div key={item._id} style={styles.feedbackCard}>
                                <FaQuoteLeft style={styles.quoteIcon} />
                                <div style={styles.ratingStars}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} style={{ color: i < item.rating ? '#fbbf24' : '#334155' }} />
                                    ))}
                                </div>
                                <p style={{ fontStyle: 'italic', color: '#e2e8f0', lineHeight: 1.8, fontSize: '1.1rem', minHeight: '80px' }}>
                                    "{item.comments || (isEn 
                                        ? "Exceptional response time. The ambulance arrived within minutes." 
                                        : "சிறந்த பதில் நேரம். ஆம்புலன்ஸ் சில நிமிடங்களில் வந்தது.")}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                                    <FaUserCircle style={{ fontSize: '2.8rem', color: '#475569', marginRight: '15px' }} />
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>
                                            {item.name || (isEn ? "Verified Citizen" : "சரிபார்க்கப்பட்ட குடிமகன்")}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                                            {item.location || (isEn ? "Tirunelveli District" : "திருநெல்வேலி மாவட்டம்")}
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.verifiedBadge}>
                                    <FaCheckCircle size={12} /> {isEn ? 'VERIFIED CITIZEN RESPONSE' : 'சரிபார்க்கப்பட்ட குடிமகன் பதில்'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                        <p>{isEn 
                            ? "No community reviews yet. Your feedback helps us improve!" 
                            : "கருத்துக்கள் எதுவும் இன்னும் இல்லை. உங்கள் கருத்துக்கள் எங்களை மேம்படுத்த உதவும்!"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;