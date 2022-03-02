import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  CostCategory,
  IncomeCategory,
  NotificationModel,
  NotificationType,
} from 'models/common.model';

export interface CommonState {
  notification: NotificationModel | null;
  descriptionMapping: DescriptionMappingModel;
}

export interface DescriptionMappingModel {
  [key: string]: CostCategory | IncomeCategory;
}

const descriptionMapping = 'descriptionMapping';

const commonSlice = createSlice({
  name: 'common',
  initialState: {
    notification: null,
    descriptionMapping: JSON.parse(
      localStorage.getItem(descriptionMapping) || '{}',
    ),
  } as CommonState,
  reducers: {
    setNotification: (
      state,
      action: PayloadAction<NotificationModel | null>,
    ) => {
      state.notification = action.payload;
    },
    addDescriptionMapping: (
      state,
      action: PayloadAction<DescriptionMappingModel>,
    ) => {
      state.descriptionMapping = {
        ...state.descriptionMapping,
        ...action.payload,
      };
      localStorage.setItem(
        descriptionMapping,
        JSON.stringify({
          ...state.descriptionMapping,
          ...action.payload,
        }),
      );
    },
  },
});

const { actions, reducer } = commonSlice;

export const showNotification = ({
  type = NotificationType.Info,
  text,
}: NotificationModel) => async (dispatch: AppDispatch) => {
  dispatch(actions.setNotification({ type, text }));
};

export const hideNotification = () => async (dispatch: AppDispatch) => {
  dispatch(actions.setNotification(null));
};

export const setDescriptionMapping = (
  descriptionMapping: DescriptionMappingModel,
) => async (dispatch: AppDispatch) => {
  dispatch(actions.addDescriptionMapping(descriptionMapping));
};

export default reducer;
