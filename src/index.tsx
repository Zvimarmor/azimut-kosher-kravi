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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)