import { AxiosError } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DashboardService } from 'services/dashboard.service';
import {
  DashboardDataModel,
  DashboardParamsModel,
  ItemModel,
  ItemParamsModel,
} from 'models/dashboard.model';
import { showNotification } from './common';

export interface DashboardState {
  loading: boolean;
  items: ItemModel[];
  balance: number;
  error: AxiosError | null;
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    loading: false,
    items: [],
    balance: 0,
    error: null,
  } as DashboardState,
  reducers: {
    setDashboardData: (state, action: PayloadAction<DashboardDataModel>) => {
      state.items = action.payload.items;
      state.balance = action.payload.balance;
    },
  },
});

const { actions, reducer } = dashboardSlice;

export const getDashboardData = (params: DashboardParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const data = await DashboardService.getDashboardData(params);
    dispatch(actions.setDashboardData(data));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const createItem = (item: ItemParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const response = await DashboardService.createItem(item);
    dispatch(showNotification({ text: response.msg }));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const updateItem = (item: ItemParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const response = await DashboardService.updateItem(item);
    dispatch(showNotification({ text: response.msg }));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const deleteItem = (id: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await DashboardService.deleteItem(id);
    dispatch(showNotification({ text: response.msg }));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export default reducer;
