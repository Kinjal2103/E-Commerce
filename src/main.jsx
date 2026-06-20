import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Clear legacy cached mock data in browser localStorage
try {
  const version = localStorage.getItem('forge_ls_version');
  if (version !== 'v2') {
    localStorage.removeItem('forge_orders');
    localStorage.removeItem('forge_saved_builds');
    localStorage.removeItem('forge_current_build');
    localStorage.removeItem('compare_ids');
    localStorage.setItem('forge_ls_version', 'v2');
  }
} catch (e) {
  console.error('Failed to clear legacy localStorage:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
