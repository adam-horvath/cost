import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // győződj meg róla, hogy ez a modul Vite kompatibilis

import App from './pages/app/App';
import store from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.scss';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<div>Loading...</div>}>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter basename="/cost">
            <App />
          </BrowserRouter>
        </I18nextProvider>
      </Suspense>
    </Provider>
  </React.StrictMode>
);

// Ha offline támogatást szeretnél, itt lehet service worker-t regisztrálni
// import * as serviceWorker from './serviceWorker';
// serviceWorker.register();