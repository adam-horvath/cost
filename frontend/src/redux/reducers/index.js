import { combineReducers } from "redux";

import auth from "./auth";
import dashboard from "./dashboard";
import query from "./query";
import chart from "./chart";
import bubble from "./bubble";
import offline from "./offline";

const rootReducer = combineReducers({
  auth,
  dashboard,
  query,
  chart,
  bubble,
  offline
});

export default rootReducer;
