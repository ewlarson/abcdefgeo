import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router';
import { ApiProvider } from './context/ApiContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { DebugProvider } from './context/DebugContext';
import { I18nProvider } from './context/I18nContext';
import { ThemeProvider } from './context/ThemeContext';
import { getActiveThemeId, getThemeRouteMode } from './config/institution';
import App from './App.tsx';
import './config/fixLeafletDefaultIcon';
import './index.css';
import './styles/leaflet.css';

const initialThemeId = getActiveThemeId();
const routeMode = getThemeRouteMode(initialThemeId);
const Router = routeMode === 'hash' ? HashRouter : BrowserRouter;
const routerBasename =
  routeMode === 'hash' ? undefined : import.meta.env.BASE_URL || '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={routerBasename}>
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
    </Router>
  </StrictMode>
);
