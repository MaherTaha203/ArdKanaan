import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/use-auth-store'

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'

// Restore any persisted session and start listening for auth changes before the
// app renders (app-level singleton, per the hooks guidance).
useAuthStore.getState().init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
