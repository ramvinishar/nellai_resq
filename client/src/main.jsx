// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
// 🚨 CRITICAL FIX: Ensure BrowserRouter is imported and aliased as Router 🚨
import { BrowserRouter as Router } from 'react-router-dom'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> 
      <App />
    </Router>
  </React.StrictMode>,
)