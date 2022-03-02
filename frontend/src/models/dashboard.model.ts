import {
  CategoryType,
  CostCategory,
  IncomeCategory
} from "models/common.model";

export interface DashboardParamsModel {
  date: string;
}

export interface DashboardDataModel {
  items: ItemModel[];
  balance: number;
}

export interface ItemModel {
  _id: string;
  group_id: string;
  amount: number;
  category: CostCategory | IncomeCategory;
  category_type: CategoryType;
  date: string;
  year: number;
  month: number;
  day: number;
  description: string;
}

export interface ItemParamsModel {
  id?: string;
  category_type: CategoryType;
  date: string;
  category: CostCategory | IncomeCategory;
  amount?: number;
  description?: string;
}

export interface ItemResponseModel {
  success: boolean;
  msg: string;
}
