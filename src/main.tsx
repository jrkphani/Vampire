import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// Enable MSW in development only
console.log('🔍 Environment check:', {
  isDev: import.meta.env.DEV,
  mockDataEnabled: import.meta.env.VITE_ENABLE_MOCK_DATA,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  hasBackendAPI: !!import.meta.env.VITE_API_BASE_URL,
});

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_DATA === 'true') {
  console.log('🔧 Starting Mock Service Worker...');
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('✅ Mock Service Worker started successfully');
} else if (import.meta.env.DEV) {
  console.log('📡 MSW disabled - connecting to real API');
} else {
  // Production environment
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.error('🚨 PRODUCTION ERROR: VITE_API_BASE_URL not configured');
    console.error('📋 Please configure your backend API URL in Amplify build settings');
    console.error('   Environment variable: VITE_API_BASE_URL');
    console.error('   Example: https://your-backend-api.com/api');
  } else {
    console.log('📡 Production mode - connecting to backend API');
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
