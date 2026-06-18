import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

// Intercept console messages to filter out harmless Firestore clock-drift warnings
const originalError = console.error;
const originalWarn = console.warn;
const shouldSuppress = (arg: any): boolean => {
  if (!arg) return false;
  const str = typeof arg === 'string' ? arg : String(arg);
  return str.includes('Detected an update time that is in the future') ||
         str.includes('update time that is in the future');
};
console.error = function (...args: any[]) {
  if (args.some(arg => shouldSuppress(arg))) return;
  originalError.apply(console, args);
};
console.warn = function (...args: any[]) {
  if (args.some(arg => shouldSuppress(arg))) return;
  originalWarn.apply(console, args);
};

import App from './App.tsx';
import './index.css';

// Register PWA service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
