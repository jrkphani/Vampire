import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Enable MSW in development
console.log('🔍 Environment check:', {
  isDev: import.meta.env.DEV,
  mockDataEnabled: import.meta.env.VITE_ENABLE_MOCK_DATA,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
  console.log('🔧 Starting Mock Service Worker...');
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('✅ Mock Service Worker started successfully');
} else {
  console.warn('⚠️ MSW not started:', {
    isDev: import.meta.env.DEV,
    mockDataEnabled: import.meta.env.VITE_ENABLE_MOCK_DATA,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
