export interface ICustomer {
  id: string;
  code: number;
  name: string;
  surname?: string;
  document?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUpsertCustomer {
  id?: string;
  name: string;
  surname?: string;
  document?: string;
  phone?: string;
  address?: string;
}
