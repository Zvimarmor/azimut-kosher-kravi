import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { logger } from './lib/utils/logger'

// Expose logger to window for debugging in console
declare global {
  interface Window {
    logger: typeof logger;
  }
}

window.logger = logger;

// Test that logger is working
logger.log('🚀 App starting - logger is working!');
logger.log('Current URL:', window.location.href);
logger.log('Timestamp:', new Date().toISOString());

// Log URL details for OAuth debugging
logger.log('URL Details at app start:');
logger.log('- pathname:', window.location.pathname);
logger.log('- search:', window.location.search);
logger.log('- hash:', window.location.hash);
logger.log('- origin:', window.location.origin);

// Parse and log all query parameters
const urlParams = new URLSearchParams(window.location.search);
const params: Record<string, string> = {};
urlParams.forEach((value, key) => {
  params[key] = value;
});
logger.log('Query parameters:', params);
logger.log('Number of query parameters:', urlParams.size);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)