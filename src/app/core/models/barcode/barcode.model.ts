export interface IBarcode {
  id: string;
  ean: string;
  product_id: string;
  company_id: string;
  created_at: string;
}

export interface ICreateBarcode {
  product_id: string;
  ean: string;
}
