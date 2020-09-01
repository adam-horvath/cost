import "babel-polyfill";
import "whatwg-fetch";
import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import createHistory from "history/createBrowserHistory";
import {
  connectRouter,
  routerMiddleware,
  ConnectedRouter
} from "connected-react-router";

import "./CostApp.css";
import Main from "./components/main/Main.js";
import rootReducer from "./redux/reducers";

const node = document.getElementById("root") || document.createElement("div");

export const history = createHistory();

const initialState = {};
const enhancers = [];
const middleware = [thunk, routerMiddleware(history)];

if (process.env.NODE_ENV === "development") {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === "function") {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  composedEnhancers
);

export default ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Main />
    </ConnectedRouter>
  </Provider>,
  node
);
