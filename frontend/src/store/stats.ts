import { AxiosError } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StatsService } from 'services/stats.service';
import { StatsResponseModel } from 'models/stats.model';

export interface StatsState {
  loading: boolean;
  data: StatsResponseModel | null;
  error: AxiosError | null;
}

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    loading: false,
    data: null,
    error: null,
  } as StatsState,
  reducers: {
    setStatsData: (state, action: PayloadAction<StatsResponseModel>) => {
      state.data = action.payload;
    },
  },
});

const { actions, reducer } = statsSlice;

export const getStatsData = (date: string) => async (
  dispatch: AppDispatch,
) => {
  try {
    const result = await StatsService.getStatsData(date);
    dispatch(actions.setStatsData(result));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export default reducer;
