import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler for debugging
const logErrorToServer = async (message: string, stack?: string) => {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    });
  } catch (e) {
    console.error('Failed to log error to server:', e);
  }
};

window.addEventListener('error', (event) => {
  console.error('🔥 Global error:', event.error);
  console.error('Message:', event.message);
  console.error('Stack:', event.error?.stack);
  logErrorToServer(event.message, event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
  logErrorToServer(
    `Unhandled promise rejection: ${event.reason}`,
    event.reason?.stack
  );
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
