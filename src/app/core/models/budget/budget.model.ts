import { ICustomer } from '../customers/customers.model';

export interface IBudgetProduct {
  id?: string;
  budgetId?: string;
  productId: string;
  productCode?: number;
  productName?: string;
  saleUnit?: string;
  isFractional?: boolean;
  quantity: number;
  unitPrice: number;
}

export interface IBudget {
  id: string;
  budgetNumber: number;
  customerId: string;
  storeId: string;
  sellerId?: string;
  observation?: string;
  deliveryForecast?: string;
  paymentType?: EnumPaymentTypes;
  createdAt: string;
  updatedAt: string;
}

export interface IBudgetView extends IBudget {
  customer?: ICustomer;
  sellerName: string;
  customerName: string;
  totalProducts: number;
  totalValue: number;
  products: IBudgetProduct[];
}

export interface IUpsertBudget {
  id?: string;
  customerId: string;
  storeId: string;
  sellerId?: string;
  observation?: string;
  deliveryForecast?: string;
  paymentType?: EnumPaymentTypes;
  products: IBudgetProduct[];
}

export enum EnumPaymentTypes {
  CASH = 'CASH',
  INSTALLMENT = 'INSTALLMENT',
}

export function PaymentTypeLabel(paymentType: EnumPaymentTypes = EnumPaymentTypes.INSTALLMENT) {
  return paymentType === EnumPaymentTypes.CASH ? 'À Vista' : 'A Prazo';
}
