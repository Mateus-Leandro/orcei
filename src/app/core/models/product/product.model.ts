import { IBarcode } from '../barcode/barcode.model';
import { IFinancialStatement } from '../financial-statement/financial-statement.model';

export interface IProduct {
  id: string;
  code: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertProduct {
  id?: string;
  name: string;
}

export interface IProductView extends IProduct {
  barcodes: IBarcode[];
  financialStatement: IFinancialStatement;
}

export interface IAddBarcode {
  productId: string;
  barcode: string;
}
