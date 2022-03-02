import request, { Methods } from 'utils/request';
import {
  DashboardDataModel,
  DashboardParamsModel,
  ItemParamsModel,
  ItemResponseModel,
} from 'models/dashboard.model';

export class DashboardService {
  static async getDashboardData(params: DashboardParamsModel) {
    return await request<DashboardDataModel>({
      resource: '/v1/main',
      data: params,
    });
  }

  static async createItem(params: ItemParamsModel) {
    return await request<ItemResponseModel>({
      resource: '/v1/item',
      data: params,
    });
  }

  static async updateItem(params: ItemParamsModel) {
    return await request<ItemResponseModel>({
      method: Methods.PUT,
      resource: '/v1/item',
      data: params,
    });
  }

  static async deleteItem(id: string) {
    return await request<ItemResponseModel>({
      method: Methods.DELETE,
      resource: `/v1/item/${id}`,
    });
  }
}
