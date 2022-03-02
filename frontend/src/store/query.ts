import { AxiosError } from 'axios';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { QueryService } from 'services/query.service';
import {
  ListItemModel,
  ListItemType,
  QueryDataModel,
  QueryListItemModel,
  QueryParamsModel,
} from 'models/query.model';
import { ItemModel } from 'models/dashboard.model';
import { CategoryType, CostCategory } from 'models/common.model';

export interface QueryState {
  loading: boolean;
  queryData: QueryDataModel | null;
  queryList: QueryListItemModel | null;
  error: AxiosError | null;
}

const querySlice = createSlice({
  name: 'query',
  initialState: {
    loading: false,
    queryData: null,
    queryList: null,
    error: null,
  } as QueryState,
  reducers: {
    setQueryData: (state, action: PayloadAction<QueryDataModel>) => {
      state.queryData = action.payload;
    },
    setQueryList: (state, action: PayloadAction<QueryListItemModel>) => {
      state.queryList = action.payload;
    },
  },
});

const { actions, reducer } = querySlice;

export const getQueryData = (params: QueryParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const result = await QueryService.getQueryData(params);
    dispatch(actions.setQueryData(result));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const mockItem: Omit<ItemModel, 'date'> = {
  _id: '',
  group_id: '',
  amount: 0,
  category: CostCategory.Other,
  category_type: CategoryType.Cost,
  year: 2015,
  month: 8,
  day: 1,
  description: '',
};

export const getQueryList = (params: QueryParamsModel) => async (
  dispatch: AppDispatch,
) => {
  try {
    const result = await QueryService.getQueryList(params);
    const items: ListItemModel[] = [];
    let date: string | null = null;
    result.items.forEach(item => {
      if (date == null || date !== item.date) {
        items.push({
          type: ListItemType.Header,
          date: item.date,
          ...mockItem,
        });
        date = item.date;
      }
      items.push({ type: ListItemType.Item, ...item });
    });
    dispatch(actions.setQueryList({ ...result, items }));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export default reducer;
