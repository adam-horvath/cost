import request from 'utils/request';
import { ChartDataModel, ChartParamsModel } from 'models/chart.model';

export class ChartService {
  static async getChartData(params: ChartParamsModel) {
    return await request<ChartDataModel>({
      resource: '/v1/chart',
      data: params,
    });
  }
}
