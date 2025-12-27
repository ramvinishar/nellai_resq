// client/src/components/OfficialNavbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import tnEmblem from '../assets/tn_emblem.png';

// TN Govt. Official Colors
const COLORS = {
    NAVY_BLUE: '#003366',
    SAFFRON: '#FF9933',
    GREEN: '#138808', // For the Indian Flag
    WHITE: '#FFFFFF',
    TEXT_DARK: '#333333'
};

const OfficialNavbar = () => {
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const navItems = [
        { name: t('home'), path: '/home' },
       
        { name: t('about_us'), path: '/about' },
        { name: t('resq_heroes'), path: '/profile' },
        { name: t('contact_us'), path: '/contact' },
    ];

    return (
        <header style={styles.header}>
            {/* Top Bar: Official Branding and Language Select */}
            <div style={styles.topBar}>
                <div style={styles.branding}>
                    {/* Placeholder for Ashoka Chakra / TN Govt Logo */}
                    <img 
                        src={tnEmblem} 
                        
                        alt="Emblem" 
                        style={styles.emblem} 
                    />
                    <div style={styles.titleContainer}>
                        <h1 style={styles.appName}>{t('app_name')}</h1>
                        <p style={styles.tagline}>{t('govt_tagline')}</p>
                    </div>
                </div>

                <div style={styles.controls}>
                    {/* Language Dropdown */}
                    <select 
                        onChange={handleLanguageChange} 
                        value={language}
                        style={styles.langSelect}
                    >
                        <option value="en">English</option>
                        <option value="ta">தமிழ்</option>
                    </select>

                    {/* Login/Signup Button */}
                    <button 
                        onClick={() => navigate('/login')} 
                        style={styles.loginButton}
                    >
                        {t('login_signup')}
                    </button>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <nav style={styles.navBar}>
                {navItems.map(item => (
                    <Link key={item.path} to={item.path} style={styles.navLink}>
                        {item.name}
                    </Link>
                ))}
                
                {/* Critical SOS/HELP Button */}
                <button 
                    onClick={() => navigate('/sos')} 
                    style={styles.sosButton}
                >
                    🚨 {t('call_help')} 🚨
                </button>
            </nav>
        </header>
    );
};

// --- Styles for Official Government Look ---
const styles = {
    header: {
        width: '100%',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        backgroundColor: COLORS.WHITE,
    },
    topBar: {
        backgroundColor: COLORS.NAVY_BLUE,
        padding: '10px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: COLORS.WHITE,
    },
    branding: {
        display: 'flex',
        alignItems: 'center',
    },
    emblem: {
        height: '45px',
        filter: 'brightness(0) invert(1)', // Makes the emblem white for contrast
        marginRight: '15px',
    },
    titleContainer: {
        lineHeight: 1.2,
    },
    appName: {
        fontSize: '1.6em',
        fontWeight: '700',
        margin: 0,
    },
    tagline: {
        fontSize: '0.8em',
        margin: 0,
        opacity: 0.8,
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
    },
    langSelect: {
        padding: '8px 10px',
        marginRight: '20px',
        borderRadius: '4px',
        border: `1px solid ${COLORS.WHITE}`,
        backgroundColor: COLORS.NAVY_BLUE,
        color: COLORS.WHITE,
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    loginButton: {
        padding: '8px 15px',
        backgroundColor: COLORS.SAFFRON,
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    navBar: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '10px 40px',
        backgroundColor: COLORS.WHITE,
        borderBottom: `3px solid ${COLORS.SAFFRON}`, // Official accent line
    },
    navLink: {
        textDecoration: 'none',
        color: COLORS.TEXT_DARK,
        padding: '8px 15px',
        marginRight: '10px',
        fontSize: '1.1rem',      // Slightly larger for better readability
        fontWeight: '800',       // Change from '600' to '800' or 'bold'
        transition: 'all 0.3s ease',
        borderBottom: '2px solid transparent', // Prepares for a hover effect
    },
    sosButton: {
        marginLeft: 'auto', // Pushes the button to the right
        padding: '10px 20px',
        backgroundColor: '#dc3545', // Standard Red for Emergency
        color: COLORS.WHITE,
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '1em',
        cursor: 'pointer',
        boxShadow: '0 0 10px rgba(220,53,69,0.5)',
    }
};

export default OfficialNavbar;