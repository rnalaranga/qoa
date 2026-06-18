import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

import axios from 'axios';

// Dynamically set API URL based on where the frontend is hosted
axios.defaults.baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : `http://${window.location.hostname}:5000`;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
