export enum Collection {
  Item = 'item',
  Balance = 'balance',
}

export enum CategoryType {
  Cost = 'COST',
  Income = 'INCOME',
}

export enum IncomeCategory {
  Gift = 'GIFT',
  State = 'STATE',
  Investment = 'INVESTMENT',
  Salary = 'SALARY',
  Loan = 'LOAN',
  Other = 'OTHER',
}

export enum CostCategory {
  Gift = 'GIFT',
  Car = 'CAR',
  Bank = 'BANK',
  Investment = 'INVESTMENT',
  Grocery = 'GROCERY',
  Pharmacy = 'PHARMACY',
  House = 'HOUSE',
  Food = 'FOOD',
  Drink = 'DRINK',
  Loan = 'LOAN',
  Luxury = 'LUXURY',
  Overhead = 'OVERHEAD',
  Clothes = 'CLOTHES',
  Phone = 'PHONE',
  Travel = 'TRAVEL',
  Other = 'OTHER',
}

export enum NotificationType {
  Error = 'Error',
  Info = 'Info',
}

export interface NotificationModel {
  type?: NotificationType;
  text: string;
}