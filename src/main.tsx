import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { ApiProvider } from './context/ApiContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { DebugProvider } from './context/DebugContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { getActiveThemeId } from './config/institution';
import App from './App.tsx';
import './config/fixLeafletDefaultIcon';
import './index.css';
import './styles/leaflet.css';

const initialThemeId = getActiveThemeId();

function registerProductionServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (typeof document === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const script = document.createElement('script');
  script.async = true;
  script.src = `${normalizedBaseUrl}registerSW.js`;
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider initialThemeId={initialThemeId}>
        <I18nProvider>
          <ApiProvider>
            <BookmarkProvider>
              <DebugProvider>
                <App />
              </DebugProvider>
            </BookmarkProvider>
          </ApiProvider>
        </I18nProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>
);

registerProductionServiceWorker();
