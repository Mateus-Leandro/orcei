import { ICreateUsercompany } from '../company/company.model';

export interface ICreateUser {
  name: string;
  email: string;
  pass: string;
  company: ICreateUsercompany;
}
