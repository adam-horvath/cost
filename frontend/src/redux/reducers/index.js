import { combineReducers, configureStore } from "@reduxjs/toolkit";

import auth from "./auth";
import dashboard from "./dashboard";
import query from "./query";
import chart from "./chart";
import bubble from "./bubble";
import offline from "./offline";

const reducer = combineReducers({
  auth,
  dashboard,
  query,
  chart,
  bubble,
  offline
});

const store = configureStore({
  reducer
});

export default store;
