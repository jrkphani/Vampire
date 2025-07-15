import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Enable MSW in development
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
  console.log('🔧 Starting Mock Service Worker...');
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('✅ Mock Service Worker started successfully');
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
