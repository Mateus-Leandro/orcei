export interface IStore {
  id: string;
  companyId: string;
  storeNumber: number | null;
  name: string;
  cnpj: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreView {
  id: string;
  storeNumber: number | null;
  name: string;
  cnpj: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertStore {
  id?: string;
  storeNumber: number | null;
  name: string;
  cnpj: string;
  phone?: string;
}
