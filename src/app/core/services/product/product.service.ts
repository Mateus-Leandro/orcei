import { Injectable } from '@angular/core';
import { ProductRepository } from '../../repositories/product/product.repository';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private repository: ProductRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll(page: number, limit: number, search: string) {
    return this.repository.findAll(page, limit, search);
  }
}
