import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './styles/app.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/**
 * Register the service worker once the app has painted.
 *
 * Deliberately after `load`: a room of 25 phones all hitting a school wi-fi
 * point at once is the worst moment to compete with the first render for
 * bandwidth. Registration failing is not an error the player needs to hear
 * about — the game works either way, it just will not be there offline.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
