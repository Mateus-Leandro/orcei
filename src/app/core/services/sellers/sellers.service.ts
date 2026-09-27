import { Injectable } from '@angular/core';
import { SellersRepository } from '../../repositories/sellers/sellers.repository';
import { IUpsertSeller } from '../../models/sellers/sellers.model';

@Injectable({
  providedIn: 'root',
})
export class SellersService {
  constructor(private repository: SellersRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }

  deleteById(id: string) {
    return this.repository.deleteById(id);
  }

  upsertSeller(upsertSeller: IUpsertSeller) {
    return this.repository.upsert(upsertSeller);
  }
}
