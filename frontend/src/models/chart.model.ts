export interface ChartDataPoint {
  [key: string]: number;
}

export interface MappedDataPoint {
  amount: number;
  year: number;
  month: number;
  sumAmount?: number;
}

export interface ChartParamsModel {
  min_year?: number;
  max_year?: number;
  min_month?: number;
  max_month?: number;
  category_types?: string;
  categories?: string;
}

export interface ChartDataModel {
  success: boolean;
  result: {
    BALANCE: ChartDataPoint[];
    COST: ChartDataPoint[];
    INCOME: ChartDataPoint[];
    SALARY: ChartDataPoint[];
    STATE: ChartDataPoint[];
    GIFT: ChartDataPoint[];
    LOAN: ChartDataPoint[];
    OTHER: ChartDataPoint[];
    BANK: ChartDataPoint[];
    CAR: ChartDataPoint[];
    CLOTHES: ChartDataPoint[];
    DRINK: ChartDataPoint[];
    FOOD: ChartDataPoint[];
    GROCERY: ChartDataPoint[];
    HOUSE: ChartDataPoint[];
    INVESTMENT: ChartDataPoint[];
    LUXURY: ChartDataPoint[];
    OVERHEAD: ChartDataPoint[];
    PHARMACY: ChartDataPoint[];
    PHONE: ChartDataPoint[];
    TRAVEL: ChartDataPoint[];
    PREV_BALANCE: number;
  };
}

export enum ChartKey {
  PrevBalance = 'prevBalance',
  Income = 'income',
  Cost = 'cost',
  Balance = 'balance',
}
