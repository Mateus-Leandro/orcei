export interface IProduct {
  id: string;
  code: number;
  name: string;
  barcode: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertProduct {
  id?: string;
  code?: number;
  name: string;
  companyId: string;
  barcode?: string;
}
