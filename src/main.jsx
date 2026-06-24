import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Clear legacy cached mock data in browser localStorage
try {
  // Migrate legacy shared 'forge_saved_builds' to user-scoped slots
  const legacyBuilds = localStorage.getItem('forge_saved_builds');
  if (legacyBuilds) {
    const token = localStorage.getItem('token');
    let targetKey = 'forge_saved_builds_guest';
    if (token && token !== 'mock_token_success') {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const userId = JSON.parse(jsonPayload).id;
        if (userId) {
          targetKey = `forge_saved_builds_${userId}`;
        }
      } catch (err) {
        // Ignore JWT decoding error
      }
    }
    
    const targetStored = localStorage.getItem(targetKey);
    let targetBuilds = targetStored ? JSON.parse(targetStored) : [];
    const parsedLegacy = JSON.parse(legacyBuilds);
    
    if (Array.isArray(parsedLegacy)) {
      parsedLegacy.forEach(legacyBuild => {
        if (legacyBuild && legacyBuild.id) {
          const exists = targetBuilds.some(tb => tb.id === legacyBuild.id);
          if (!exists) {
            targetBuilds.push(legacyBuild);
          }
        }
      });
      localStorage.setItem(targetKey, JSON.stringify(targetBuilds));
    }
    
    localStorage.removeItem('forge_saved_builds');
  }
  // Clean up preseeded builds from any saved builds slots
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('forge_saved_builds')) {
      const storedBuilds = localStorage.getItem(key);
      if (storedBuilds) {
        try {
          const parsed = JSON.parse(storedBuilds);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(b => b && b.id && !String(b.id).startsWith('preseed'));
            if (cleaned.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          }
        } catch (err) {
          // Ignore parse errors for corrupt items
        }
      }
    }
  }

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
