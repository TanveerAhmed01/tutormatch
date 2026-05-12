import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Set API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://tutormatch-beige.vercel.app'
  : 'http://localhost:3001'

// Make it globally available
window.API_BASE_URL = API_BASE_URL

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)