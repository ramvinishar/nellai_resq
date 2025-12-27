import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, 
    FaShieldAlt, FaAmbulance, FaFire 
} from 'react-icons/fa';

const ContactPage = () => {
    const { language } = useLanguage();
    const isEn = language === 'en';

    const emergencyContacts = [
        { 
            titleEn: 'Police (General)', 
            titleTa: 'காவல்துறை (பொது)', 
            number: '100', 
            icon: FaShieldAlt, 
            color: '#003366' // Navy Blue
        },
        { 
            titleEn: 'Ambulance / Medical', 
            titleTa: 'ஆம்புலன்ஸ் / மருத்துவம்', 
            number: '108', 
            icon: FaAmbulance, 
            color: '#28a745' // Emergency Green
        },
        { 
            titleEn: 'Fire & Rescue', 
            titleTa: 'தீ மற்றும் மீட்பு', 
            number: '101', 
            icon: FaFire, 
            color: '#dc3545' // Fire Red
        }
    ];

    const styles = useMemo(() => ({
        container: {
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            paddingBottom: '80px'
        },
        // NEW: Hero Section with Background Image
        heroSection: {
            position: 'relative',
            height: '350px',
            backgroundImage: `linear-gradient(rgba(0, 51, 102, 0.7), rgba(0, 51, 102, 0.7)), url('https://media.istockphoto.com/id/2189341261/photo/contact-us-customer-service-channel-concept-using-laptop-and-virtual-screen-icons-of-customer.jpg?s=612x612&w=0&k=20&c=olRPoOJ0LjmuHEQ9igXtNqPAf51VhEoBaH4sIKpWx3c=')`, // Emergency response theme
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            marginBottom: '-60px', // Pulls the cards up into the hero section
            padding: '0 20px'
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '900',
            margin: '0 0 10px 0',
            textShadow: '2px 2px 10px rgba(0,0,0,0.3)'
        },
        heroSubtitle: {
            fontSize: '1.2rem',
            maxWidth: '700px',
            opacity: '0.9'
        },
        tricolorUnderline: {
            width: '100px',
            height: '5px',
            marginTop: '15px',
            background: 'linear-gradient(90deg, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)',
            borderRadius: '10px',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 10 // Ensures cards sit on top of the hero
        },
        emergencyCard: {
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: '5px solid transparent'
        },
        iconBox: (color) => ({
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            marginBottom: '20px'
        }),
        numberText: (color) => ({
            fontSize: '3.2rem',
            fontWeight: '900',
            color: color,
            margin: '10px 0'
        }),
        adminSection: {
            maxWidth: '1000px',
            margin: '80px auto 0',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            borderLeft: '10px solid #003366'
        },
        globalStyles: `
            .card-hover:hover { transform: translateY(-10px); }
            .btn-call { transition: filter 0.2s; }
            .btn-call:hover { filter: brightness(1.2); }
        `
    }), []);

    return (
        <div style={styles.container}>
            <style>{styles.globalStyles}</style>
            
            {/* 1. HERO BANNER WITH IMAGE */}
            <div style={styles.heroSection}>
                <h1 style={styles.heroTitle}>{isEn ? 'Contact Us' : 'தொடர்பு கொள்க'}</h1>
                <p style={styles.heroSubtitle}>
                    {isEn 
                        ? 'Nellai ResQ Heroes are available 24/7 to safeguard Tirunelveli citizens.' 
                        : 'திருநெல்வேலி குடிமக்களைப் பாதுகாக்க நெல்லை ரெஸ்க்யூ வீரர்கள் 24/7 தயார் நிலையில் உள்ளனர்.'}
                </p>
                <div style={styles.tricolorUnderline}></div>
            </div>

            {/* 2. EMERGENCY CARDS GRID */}
            <div style={styles.grid}>
                {emergencyContacts.map((contact) => (
                    <a 
                        key={contact.number} 
                        href={`tel:${contact.number}`} 
                        style={{...styles.emergencyCard, borderBottomColor: contact.color}}
                        className="card-hover"
                    >
                        <div style={styles.iconBox(contact.color)}>
                            <contact.icon size={40} />
                        </div>
                        <h3 style={{fontSize: '1.4rem', color: '#1e293b'}}>
                            {isEn ? contact.titleEn : contact.titleTa}
                        </h3>
                        <div style={styles.numberText(contact.color)}>{contact.number}</div>
                        <span style={{
                            backgroundColor: contact.color,
                            color: 'white',
                            padding: '12px 30px',
                            borderRadius: '100px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }} className="btn-call">
                            <FaPhoneAlt /> {isEn ? 'TAP TO CALL' : 'அழைக்கத் தட்டவும்'}
                        </span>
                    </a>
                ))}
            </div>

            {/* 3. ADMINISTRATIVE CONTACTS */}
            <div style={styles.adminSection}>
                <div style={{flex: '1 1 300px'}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#003366'}}>
                        <FaMapMarkerAlt /> {isEn ? 'Official Address' : 'அலுவலக முகவரி'}
                    </h3>
                    <p style={{color: '#475569', lineHeight: '1.6'}}>
                        <strong>{isEn ? 'Project Director, Nellai ResQ' : 'திட்ட இயக்குனர், நெல்லை ரெஸ்க்யூ'}</strong><br />
                        {isEn ? 'Emergency Service Dept, Tirunelveli District Collectorate.' : 'அவசர சேவைத் துறை, திருநெல்வேலி மாவட்ட ஆட்சியர் அலுவலகம்.'}<br />
                        Tamil Nadu, India.
                    </p>
                </div>
                <div style={{flex: '1 1 300px'}}>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#003366'}}>
                        <FaEnvelope /> {isEn ? 'Email Us' : 'மின்னஞ்சல் அனுப்புக'}
                    </h3>
                    <a href="mailto:support.nellairesq@tn.gov.in" style={{
                        color: '#2563eb', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        fontSize: '1.1rem'
                    }}>
                        support.nellairesq@tn.gov.in
                    </a>
                    <p style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '10px'}}>
                        {isEn ? '*Non-emergency support only' : '*அவசரகாலமற்ற ஆதரவுக்கு மட்டும்'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;