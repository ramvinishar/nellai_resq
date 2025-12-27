import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Import Pages
import LoginSignupPage from './pages/LoginSignupPage';
import DispatchDashboard from './pages/DispatchDashboard';
import SosPage from './pages/SosPage';
import TrackingPage from './pages/TrackingPage';
import ResponderNav from './pages/ResponderNav'; 
import SplashScreen from './pages/SplashScreen'; 
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';      
import UserProfilePage from './pages/UserProfilePage'; 
import ContactUsPage from './pages/ContactUsPage';  
import OfficialNavbar from './components/OfficialNavbar';

const Layout = () => {
    const location = useLocation();

    // 1. Hide Navbar on Splash (/) and SOS page 
    // We remove '/splash' because Splash is now at '/'
    const hideNavbar = location.pathname === '/' || location.pathname === '/sos';

    return (
        <>
            {!hideNavbar && <OfficialNavbar />}
            <Routes>
                {/* 2. ROOT: This is the first thing that loads */}
                <Route path="/" element={<SplashScreen />} />

                {/* 3. HOME: The Landing Page */}
                <Route path="/home" element={<HomePage />} /> 

                {/* 4. LOGIN: Dedicated path for Staff */}
                <Route path="/login" element={<LoginSignupPage />} />

                {/* Other Routes */}
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/dispatch" element={<DispatchDashboard />} />
                <Route path="/sos" element={<SosPage />} />
                <Route path="/track/:incidentId" element={<TrackingPage />} />
                <Route path="/responder/:vehicleId" element={<ResponderNav />} />
                
                {/* 5. REDIRECT: If someone types /splash, send them to / */}
                <Route path="/splash" element={<Navigate to="/" replace />} />
                
                <Route path="*" element={<p style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</p>} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <LanguageProvider>
            <Layout />
        </LanguageProvider>
    );
};

export default App;