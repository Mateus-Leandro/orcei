export interface IStore {
  id: string;
  companyId: string;
  storeNumber: string;
  name: string;
  cnpj: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreView {
  id: string;
  storeNumber: string;
  name: string;
  cnpj: string;
  createdAt: string;
  updatedAt: string;
}
