import { IBarcode } from '../barcode/barcode.model';
import { IFinancialStatement, IFinancialStatementView } from '../financial-statement/financial-statement.model';

export type ProductSaleUnit =
  | 'UN'
  | 'KG'
  | 'G'
  | 'L'
  | 'ML'
  | 'M'
  | 'CX'
  | 'FD'
  | 'PCT'
  | 'DZ'
  | 'PC'
  | 'SC';

export const PRODUCT_SALE_UNIT_OPTIONS: { value: ProductSaleUnit; label: string }[] = [
  { value: 'UN', label: 'UN - Unidade' },
  { value: 'KG', label: 'KG - Quilograma' },
  { value: 'G', label: 'G - Grama' },
  { value: 'L', label: 'L - Litro' },
  { value: 'ML', label: 'ML - Mililitro' },
  { value: 'M', label: 'M - Metro' },
  { value: 'CX', label: 'CX - Caixa' },
  { value: 'FD', label: 'FD - Fardo' },
  { value: 'PCT', label: 'PCT - Pacote' },
  { value: 'DZ', label: 'DZ - Dúzia' },
  { value: 'PC', label: 'PC - Peça' },
  { value: 'SC', label: 'SC - Saco' },
];

export interface IProduct {
  id: string;
  code: number;
  name: string;
  saleUnit: ProductSaleUnit;
  isFractional: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertProduct {
  id?: string;
  name: string;
  saleUnit: ProductSaleUnit;
  isFractional: boolean;
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
