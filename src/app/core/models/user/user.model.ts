import { ICreateUsercompany } from '../company/company.model';

export interface ICreateUser {
  name: string;
  email: string;
  pass: string;
  company: ICreateUsercompany;
}
export interface ICreateCompanyUser {
  name: string;
  email: string;
  password: string;
}

export interface IUserView {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Detalhe usado na edição (inclui e-mail, vindo de auth.users via backend).
export interface IUserDetail {
  id: string;
  name: string;
  email: string;
}

export interface IUpdateCompanyUser {
  id: string;
  name: string;
  email: string;
}
