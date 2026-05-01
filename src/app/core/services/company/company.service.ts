import { Injectable } from '@angular/core';
import { CompanyRepository } from '../../repositories/company/company.repository';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private repository: CompanyRepository) {}

  searchForCnpj(cnpj: string) {
    return this.repository.searchForCnpj(cnpj);
  }
}
