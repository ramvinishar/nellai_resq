import React, { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
    FaBullseye, FaBrain, FaShieldAlt, FaMapMarkedAlt, 
    FaLandmark, FaUsers, FaPhoneAlt, FaEnvelope,
    FaStethoscope, FaFireExtinguisher, FaUserShield 
} from 'react-icons/fa';
// Importing the background image ensuring Vite processes it correctly
import aboutBg from '../assets/about.png'; 

const AboutUsPage = () => {
  // Corrected Hook Destructuring
    const { t, language } = useLanguage();
    const isEn = language === 'en';
    // 1. Mission and AI Data
    const sections = [
        {
            title: isEn ? "Our Mission" : "எங்கள் நோக்கம்",
            subtitle: isEn ? "Saving Critical Minutes" : "முக்கியமான நிமிடங்களைச் சேமித்தல்",
            content: isEn 
                ? "Nellai ResQ is a pioneering initiative under the Government of Tamil Nadu to modernize emergency response. Our core focus is drastically reducing response times for medical, fire, and police incidents across the Tirunelveli region."
                : "நெல்லாய் ரெஸ்க்யூ என்பது அவசரகால பதிலளிப்பை நவீனமயமாக்குவதற்காக தமிழ்நாடு அரசின் கீழ் தொடங்கப்பட்ட ஒரு முன்னோடி முயற்சியாகும். திருநெல்வேலி மண்டலம் முழுவதும் பதில் நேரத்தைக் கணிசமாகக் குறைப்பதே எங்கள் நோக்கம்.",
            icon: FaBullseye,
            color: '#ef4444' // Red color for mission
        },
        {
            title: isEn ? "The AI Edge" : "AI-இன் சிறப்பு",
            subtitle: isEn ? "Intelligent Allocation" : "அறிவார்ந்த ஒதுக்கீடு",
            content: isEn 
                ? "Unlike traditional systems, Nellai ResQ uses AI to analyze real-time vehicle status and traffic congestion. The system automatically allocates the fastest vehicle—not just the closest—by calculating an optimized route (Optimized ETA)."
                : "பாரம்பரிய அமைப்புகளைப் போலல்லாமல், Nellai ResQ ஆனது வாகனத்தின் நிலை மற்றும் போக்குவரத்து நெரிசல் தரவை பகுப்பாய்வு செய்ய AI-ஐப் பயன்படுத்துகிறது. இது மிக அருகில் உள்ள வாகனத்தை மட்டும் அல்லாமல், வேகமான வாகனத்தை ஒதுக்குகிறது.",
            icon: FaBrain,
            color: '#3b82f6' // Blue color for AI
        }
    ];

    // 2. Response Partners Data
    const partners = [
        { name: isEn ? "Police Dept" : "காவல்துறை", icon: FaUserShield, color: '#1e40af' },
        { name: isEn ? "Medical Services" : "மருத்துவ சேவை", icon: FaStethoscope, color: '#059669' },
        { name: isEn ? "Fire & Rescue" : "தீயணைப்பு", icon: FaFireExtinguisher, color: '#dc2626' }
    ];

    // Styles with Slanted Hero
    const styles = useMemo(() => ({
        wrapper: {
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            paddingBottom: '80px',
            color: '#1e293b'
        },
        hero: {
            // Background logic with gradient overlay for text legibility
            backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.8), rgba(0, 31, 63, 0.7)), url(${aboutBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: 'white',
            padding: '140px 20px',
            textAlign: 'center',
            marginBottom: '60px',
            // Specific design slant from your screenshot
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        },
        container: { maxWidth: '1100px', margin: '0 auto', padding: '0 20px' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' },
        card: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            textAlign: 'left'
        },
        iconBox: (color) => ({
            width: '60px', height: '60px', borderRadius: '16px',
            backgroundColor: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: '25px'
        }),
        supportCard: {
            marginTop: '80px', background: '#ffffff', borderRadius: '32px',
            padding: '50px', border: '2px solid #e2e8f0', display: 'flex',
            flexWrap: 'wrap', gap: '40px', alignItems: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)'
        },
        global: `
            .hover-card:hover { transform: translateY(-10px); transition: 0.3s; box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; }
            .btn-action { background: #003366; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 10px; transition: 0.3s; }
        `
    }), [aboutBg]);

    return (
        <div style={styles.wrapper}>
            <style>{styles.global}</style>
            
            {/* 1. HERO SECTION WITH BILINGUAL TEXT */}
            <header style={styles.hero}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '15px' }}>
                    {isEn ? "About Us" : "எங்களைப் பற்றி"}
                </h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '750px', margin: '0 auto' }}>
                    {isEn 
                        ? "Modernizing Tirunelveli's Emergency Infrastructure through Artificial Intelligence and Official Governance."
                        : "செயற்கை நுண்ணறிவு மற்றும் அதிகாரப்பூர்வ நிர்வாகத்தின் மூலம் திருநெல்வேலியின் அவசரகால உள்கட்டமைப்பை நவீனமயமாக்குதல்."}
                </p>
            </header>

            <div style={styles.container}>
                {/* 2. MISSION & TECH GRID */}
                <div style={styles.grid}>
                    {sections.map((section, index) => (
                        <div key={index} style={styles.card} className="hover-card">
                            <div style={styles.iconBox(section.color)}>
                                <section.icon />
                            </div>
                            <h4 style={{ color: section.color, fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                                {section.title}
                            </h4>
                            <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '15px', fontWeight: 800 }}>
                                {section.subtitle}
                            </h2>
                            <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 3. PARTNERS SECTION */}
                <div style={{ marginTop: '100px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '15px' }}>
                        {isEn ? "Integrated Response Network" : "ஒருங்கிணைந்த பதிலளிப்பு நெட்வொர்க்"}
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '50px' }}>
                        {isEn ? "Unified coordination between district departments" : "மாவட்ட துறைகளுக்கு இடையே ஒருங்கிணைந்த ஒத்துழைப்பு"}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
                        {partners.map((p, i) => (
                            <div key={i} style={{ textAlign: 'center', minWidth: '150px' }}>
                                <div style={{ fontSize: '2.5rem', color: p.color, marginBottom: '10px' }}><p.icon /></div>
                                <p style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{p.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. SUPPORT & CONTACT CARD */}
                <div style={styles.supportCard}>
                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#003366', marginBottom: '15px' }}>
                            {isEn ? "Administrative Support" : "நிர்வாக ஆதரவு"}
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            {isEn 
                                ? "Have questions about the platform or need technical assistance? Our support team is available for non-emergency coordination."
                                : "தளத்தைப் பற்றி கேள்விகள் உள்ளதா அல்லது தொழில்நுட்ப உதவி தேவையா? அவசரமற்ற ஒருங்கிணைப்புக்கு எங்கள் ஆதரவுக் குழு உள்ளது."}
                        </p>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '250px' }}>
                        <a href="tel:+914621234567" className="btn-action">
                            <FaPhoneAlt /> {isEn ? "Help Desk" : "உதவி மையம்"}
                        </a>
                        <a href="mailto:support@nellairesq.tn.gov.in" className="btn-action" style={{ backgroundColor: '#f1f5f9', color: '#003366' }}>
                            <FaEnvelope /> {isEn ? "Email Support" : "மின்னஞ்சல் ஆதரவு"}
                        </a>
                    </div>
                </div>
            </div>

            {/* 5. FOOTER */}
            <footer style={{ textAlign: 'center', marginTop: '100px', padding: '60px 20px', borderTop: '1px solid #e2e8f0' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Government_of_Tamil_Nadu_Logo.svg/100px-Government_of_Tamil_Nadu_Logo.svg.png" 
                     alt="TN Govt Logo" style={{ height: '90px', marginBottom: '25px' }} />
                <p style={{ color: '#94a3b8', fontWeight: 700 }}>— {t('govt_tagline')} —</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px', color: '#cbd5e1' }}>
                    <FaLandmark size={24} />
                    <FaUsers size={24} />
                    <FaMapMarkedAlt size={24} />
                </div>
            </footer>
        </div>
    );
};

export default AboutUsPage;