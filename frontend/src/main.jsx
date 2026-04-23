import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// initialize mock backend before the app mounts so existing axios calls are intercepted
import './api/mockBackend'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
