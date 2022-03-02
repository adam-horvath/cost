import request from 'utils/request';
import { StatsResponseModel } from 'models/stats.model';

export class StatsService {
  static async getStatsData(date: string) {
    return await request<StatsResponseModel>({
      resource: '/v1/stats',
      data: {
        date,
      },
    });
  }
}
