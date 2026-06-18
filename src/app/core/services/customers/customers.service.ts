import { Injectable } from '@angular/core';
import { CustomersRepository } from '../../repositories/customers/customers.repository';
import { IUpsertCustomer } from '../../models/customers/customers.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private repository: CustomersRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }

  deleteById(id: string) {
    return this.repository.deleteById(id);
  }

  upsertCustomer(upsertCustomer: IUpsertCustomer) {
    return this.repository.upsert(upsertCustomer);
  }
}
