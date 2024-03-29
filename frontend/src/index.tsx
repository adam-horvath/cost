import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import i18n from 'i18n';
import { I18nextProvider } from 'react-i18next';
import { createBrowserHistory } from 'history';

import * as serviceWorker from './serviceWorker';
import store from 'store';
import App from 'pages/app/App';
import 'bootstrap/dist/css/bootstrap.css';
import './index.scss';

const history = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback=" ">
        <I18nextProvider i18n={i18n}>
          <Router history={history}>
            <App />
          </Router>
        </I18nextProvider>
      </Suspense>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
