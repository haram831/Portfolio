import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Start the knitting sequence at the top before the browser restores scroll.
window.history.scrollRestoration = 'manual'
window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
