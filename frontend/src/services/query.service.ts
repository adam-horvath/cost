import request from "utils/request";
import {
  QueryParamsModel,
  QueryDataModel,
  QueryListModel
} from "models/query.model";

export class QueryService {
  static async getQueryData(params: QueryParamsModel) {
    return await request<QueryDataModel>({
      resource: "/v1/query",
      data: params
    });
  }

  static async getQueryList(params: QueryParamsModel) {
    return await request<QueryListModel>({
      resource: "/v1/query-list",
      data: params
    });
  }
}
