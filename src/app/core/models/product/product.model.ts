import { IBarcode } from '../barcode/barcode.model';
import { IFinancialStatement, IFinancialStatementView } from '../financial-statement/financial-statement.model';

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
  financialStatements?: IFinancialStatementView[];
}

export interface IAddBarcode {
  productId: string;
  barcode: string;
}
