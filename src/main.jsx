import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* 
// --- Security & Anti-Copy Protection ---
// Blocks right-click, F12, and common inspect shortcuts.
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', (e) => {
  // F12
  if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
  // Ctrl+Shift+I / J / C (DevTools)
  if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) e.preventDefault();
  // Ctrl+U (View Source)
  if (e.ctrlKey && ['U', 'u'].includes(e.key)) e.preventDefault();
  // Ctrl+S (Save Website)
  if (e.ctrlKey && ['S', 's'].includes(e.key)) e.preventDefault();
});
*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
