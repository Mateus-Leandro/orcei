import { Injectable } from '@angular/core';
import { ProductRepository } from '../../repositories/product/product.repository';
import { IUpsertProduct } from '../../models/product/product.model';

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

  deleteBarcodeById(id: string) {
    return this.repository.deleteBarcodeById(id);
  }

  upsertProduct(upsertProduct: IUpsertProduct) {
    return this.repository.upsert(upsertProduct);
  }
}
