import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// arranca el Service Worker para el modo Offline
import { registerSW } from 'virtual:pwa-register'

// Inicia la sincronización en segundo plano de inmediato
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)