import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ─── API CONFIGURATION ───
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
console.log(" API Base URL:", API_BASE_URL);

// Make it global so all components can access it
window.API_BASE_URL = API_BASE_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)