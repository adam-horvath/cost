import { AxiosError } from "axios";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AuthService } from "services/auth.service";
import {
  CredentialsModel,
  CredentialsResponseModel
} from "models/auth.model";
import { Token } from "common/Constants";

export interface AuthState {
  loading: boolean;
  token: string | null;
  id?: string | null;
  error: AxiosError | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    token: localStorage.getItem(Token) || null,
    id: null,
    error: null
  } as AuthState,
  reducers: {
    setTokenAndId: (state, action: PayloadAction<CredentialsResponseModel | null>) => {
      setToken(action.payload?.token);
      state.token = action.payload?.token || null;
      state.id = action.payload?.id;
    },
    logout() {
      setToken(null);
    }
  }
});

const { actions, reducer } = authSlice;

const setToken = (token?: string | null) => {
  if (token) {
    localStorage.setItem(Token, token);
  } else {
    localStorage.removeItem(Token);
  }
};

export const login = (credentials: CredentialsModel) => async (
  dispatch: AppDispatch
) => {
  try {
    const authResponse = await AuthService.login(credentials);
    dispatch(actions.setTokenAndId(authResponse));
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const logout = () => async (dispatch: AppDispatch) => {
  dispatch(actions.logout());
};

export default reducer;
