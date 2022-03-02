import {
  CategoryType,
  Collection,
  CostCategory,
  IncomeCategory,
} from 'models/common.model';
import { ItemModel } from 'models/dashboard.model';

export interface QueryParamsModel {
  collection: Collection;
  category_type: CategoryType;
  category?: CostCategory | IncomeCategory;
  exclude_category?: boolean;
  description?: string;
  description_like?: boolean;
  min_amount?: number;
  max_amount?: number;
  min_date?: Date;
  max_date?: Date;
  year?: number;
  month?: number;
}

export interface QueryDataModel {
  success: boolean;
  value: number;
  numberOfItems: number;
}

export interface QueryListModel {
  success: boolean;
  items: ItemModel[];
}

export enum ListItemType {
  Header = 'header',
  Item = 'item',
}

export interface ListItemModel extends ItemModel {
  type: ListItemType;
}

export interface QueryListItemModel {
  success: boolean;
  items: ListItemModel[];
}

export enum ToggleState {
  Left = 'left',
  Right = 'right',
}
