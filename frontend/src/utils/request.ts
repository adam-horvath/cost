import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { Token } from 'common/Constants';
import { NotificationType } from 'models/common.model';

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

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://horvathadam.info/api';

const axiosInstance = axios.create({});

axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error: AxiosError) => {
    const [{ default: store }, { showNotification }, { logout }] =
      await Promise.all([
        import('store'),
        import('store/common'),
        import('store/auth'),
      ]);

    store.dispatch(
      showNotification({
        type: NotificationType.Error,
        text: error.message,
      }),
    );
    store.dispatch(logout());
    throw error;
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
