import { ICustomer } from '../customers/customers.model';

export interface IBudgetProduct {
  id?: string;
  budgetId?: string;
  productId: string;
  productName?: string;
  saleUnit?: string;
  quantity: number;
  unitPrice: number;
}

export interface IBudget {
  id: string;
  customerId: string;
  storeId: string;
  observation?: string;
  deliveryForecast?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudgetView extends IBudget {
  customer?: ICustomer;
  customerName: string;
  totalProducts: number;
  totalValue: number;
  products: IBudgetProduct[];
}

export interface IUpsertBudget {
  id?: string;
  customerId: string;
  storeId: string;
  observation?: string;
  deliveryForecast?: string;
  products: IBudgetProduct[];
}
