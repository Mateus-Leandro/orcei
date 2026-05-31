export interface IFinancialStatement {
  id: string;
  companyId: string;
  storeId: string;
  productId: string;
  margin: string;
  costPrice: number;
  salePrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFinancialStatementView extends IFinancialStatement {
  storeName: string;
}

export interface IUpsertFinancialStatement {
  id?: string;
  storeId: string;
  productId: string;
  margin?: number | null;
  costPrice?: number | null;
  salePrice?: number | null;
}
