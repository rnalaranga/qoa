import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'

import axios from 'axios';

// Backend API calls will now automatically use relative paths (e.g., /api/printers)
// In production (Nginx), Nginx will proxy /api to the backend port 5000
// In development, Vite will proxy /api to localhost:5000

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
