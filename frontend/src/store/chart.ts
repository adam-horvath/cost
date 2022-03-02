import { AxiosError } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ChartService } from 'services/chart.service';
import {
  ChartDataModel,
  ChartDataPoint,
  ChartParamsModel,
  MappedDataPoint,
} from 'models/chart.model';

export interface ChartState {
  loading: boolean;
  BALANCE?: MappedDataPoint[];
  COST?: MappedDataPoint[];
  INCOME?: MappedDataPoint[];
  SALARY?: MappedDataPoint[];
  STATE?: MappedDataPoint[];
  GIFT?: MappedDataPoint[];
  LOAN?: MappedDataPoint[];
  OTHER?: MappedDataPoint[];
  BANK?: MappedDataPoint[];
  CAR?: MappedDataPoint[];
  CLOTHES?: MappedDataPoint[];
  DRINK?: MappedDataPoint[];
  FOOD?: MappedDataPoint[];
  GROCERY?: MappedDataPoint[];
  HOUSE?: MappedDataPoint[];
  INVESTMENT?: MappedDataPoint[];
  LUXURY?: MappedDataPoint[];
  OVERHEAD?: MappedDataPoint[];
  PHARMACY?: MappedDataPoint[];
  PHONE?: MappedDataPoint[];
  TRAVEL?: MappedDataPoint[];
  prevBalance: number;
  error: AxiosError | null;
}

const chartSlice = createSlice({
  name: 'chart',
  initialState: {
    loading: false,
    BALANCE: undefined,
    COST: undefined,
    INCOME: undefined,
    SALARY: undefined,
    STATE: undefined,
    GIFT: undefined,
    LOAN: undefined,
    OTHER: undefined,
    BANK: undefined,
    CAR: undefined,
    CLOTHES: undefined,
    DRINK: undefined,
    FOOD: undefined,
    GROCERY: undefined,
    HOUSE: undefined,
    INVESTMENT: undefined,
    LUXURY: undefined,
    OVERHEAD: undefined,
    PHARMACY: undefined,
    PHONE: undefined,
    TRAVEL: undefined,
    prevBalance: 0,
    error: null,
  } as ChartState,
  reducers: {
    setChartData: (state, action: PayloadAction<ChartDataModel>) => {
      const { result } = action.payload;
      if (result.BALANCE) {
        state.prevBalance = result.PREV_BALANCE;
        state.BALANCE = mapDataPoints(result.BALANCE, result.PREV_BALANCE);
      } else {
        state.BALANCE = undefined;
      }
      if (result.COST) {
        state.COST = mapDataPoints(result.COST);
      } else {
        state.COST = undefined;
      }
      if (result.INCOME) {
        state.INCOME = mapDataPoints(result.INCOME);
      } else {
        state.INCOME = undefined;
      }
      for (let key in result) {
        if (
          result.hasOwnProperty(key) &&
          !['BALANCE', 'COST', 'INCOME', 'PREV_BALANCE'].includes(key)
        ) {
          // @ts-ignore
          state[key] = mapDataPoints(result[key]);
        }
      }
      for (let key of Object.keys(state).filter(
        (key) =>
          ![
            'loading',
            'error',
            'BALANCE',
            'COST',
            'INCOME',
            'prevBalance',
          ].includes(key),
      )) {
        if (!result.hasOwnProperty(key)) {
          // @ts-ignore
          state[key] = undefined;
        }
      }
    },
  },
});

const mapDataPoints = (
  points: ChartDataPoint[],
  prevBalance?: number,
): MappedDataPoint[] => {
  const mappedDataPoints: Array<MappedDataPoint> =
    points.map((item) => {
      const date = Object.keys(item)[0];
      return {
        year: Number(date.split('_')[0]),
        month: Number(date.split('_')[1]),
        amount: item[date],
      };
    }) || [];
  mappedDataPoints.sort((a, b) =>
    a.year < b.year ? -1 : a.year > b.year ? 1 : a.month < b.month ? -1 : 1,
  );
  if (prevBalance || prevBalance === 0) {
    let sumAmount = prevBalance;
    mappedDataPoints.forEach((item) => {
      sumAmount += item.amount;
      item.sumAmount = sumAmount;
    });
  }
  return mappedDataPoints;
};

const { actions, reducer } = chartSlice;

export const getChartData = (params: ChartParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const result = await ChartService.getChartData(params);
    dispatch(actions.setChartData(result));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export default reducer;
