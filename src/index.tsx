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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)