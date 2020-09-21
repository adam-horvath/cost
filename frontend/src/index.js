import "./polyfill";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import i18n from "i18n";
import store from "./redux/reducers";
import Main from "./components/main/Main";

import "bootstrap/dist/css/bootstrap.css";
import "./index.scss";

import * as serviceWorker from "./registerServiceWorker";

const history = createBrowserHistory();

ReactDOM.render(
    <Provider store={store}>
        <Suspense fallback=" ">
            <I18nextProvider i18n={i18n}>
                <BrowserRouter history={history} basename={'/cost'}>
                    <Main />
                </BrowserRouter>
            </I18nextProvider>
        </Suspense>
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
