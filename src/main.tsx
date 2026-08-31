import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 100dvh no siempre se recalcula bien en el primer render de un PWA
// instalado (bug conocido en varios navegadores móviles: la primera
// medición puede quedar "vieja" mientras el navegador todavía está
// asentando su tamaño real, y nada la corrige después). Medimos la
// altura real con JS, la exponemos como variable CSS (con 100dvh como
// respaldo mientras este script todavía no corrió), y volvemos a medir
// varias veces después de cargar para agarrar ese asentamiento tardío.
function actualizarAltoApp() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
actualizarAltoApp();
window.addEventListener('resize', actualizarAltoApp);
window.addEventListener('orientationchange', actualizarAltoApp);
window.addEventListener('pageshow', actualizarAltoApp);
document.addEventListener('visibilitychange', actualizarAltoApp);
window.visualViewport?.addEventListener('resize', actualizarAltoApp);
window.addEventListener('load', () => {
  actualizarAltoApp();
  setTimeout(actualizarAltoApp, 60);
  setTimeout(actualizarAltoApp, 300);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
