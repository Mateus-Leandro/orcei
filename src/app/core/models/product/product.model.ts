import { IBarcode } from '../barcode/barcode.model';

export interface IProduct {
  id: string;
  code: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertProduct {
  id?: string;
  code?: number;
  name: string;
}

export interface IProductView extends IProduct {
  barcodes: IBarcode[];
}
