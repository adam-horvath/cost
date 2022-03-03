import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { createBrowserHistory } from 'history';

import { Token } from 'common/Constants';
import store from 'store';
import { showNotification } from 'store/common';
import { NotificationType } from 'models/common.model';
import { logout } from 'store/auth';

export enum Methods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
}

export interface RequestConfig extends AxiosRequestConfig {
  resource: string;
  method?: Methods;
}

// const API_BASE_URL = 'http://localhost:8080/api';
const API_BASE_URL = 'https://horvathadam.info/api';

const axiosInstance = axios.create({});

axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    //store.dispatch(hideLoader());
    store.dispatch(
      showNotification({
        type: NotificationType.Error,
        text: error.message,
      }),
    );
    store.dispatch(logout());
    return Promise.reject(error);
  },
);

async function request<T = void>({
  resource,
  method = Methods.POST,
  ...config
}: RequestConfig) {
  config = config || {};
  const token = localStorage.getItem(Token);
  if (token) {
    config = {
      ...config,
      headers: {
        Authorization: token,
      },
    };
  }
  const { data: response } = await axiosInstance.request<T>({
    method,
    url: API_BASE_URL + resource,
    ...config,
  });
  return response;
}

export default request;
