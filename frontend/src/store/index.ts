import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from './auth';
import chartReducer from './chart';
import commonReducer from './common';
import dashboardReducer from './dashboard';
import queryReducer from './query';
import statsReducer from './stats';

const rootReducer = combineReducers({
  auth: authReducer,
  chart: chartReducer,
  common: commonReducer,
  dashboard: dashboardReducer,
  query: queryReducer,
  stats: statsReducer,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;

declare global {
  type ApplicationState = ReturnType<typeof rootReducer>;

  type AppDispatch = typeof store.dispatch;

  type GetState = () => ApplicationState;
}
