import { Injectable } from '@angular/core';
import { StoreRepository } from '../../repositories/store/store.repository';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(private repository: StoreRepository) {}

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }
}
