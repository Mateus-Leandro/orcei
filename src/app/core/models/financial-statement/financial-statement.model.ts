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
