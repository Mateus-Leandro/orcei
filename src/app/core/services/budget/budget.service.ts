import { Injectable } from '@angular/core';
import { BudgetRepository } from '../../repositories/budget/budget.repository';
import { IUpsertBudget } from '../../models/budget/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(private repository: BudgetRepository) {}

  findById(id: string) {
    return this.repository.findById(id);
  }

  findAll(page: number, limit: number, search: string, storeId?: string) {
    return this.repository.findAll(page, limit, search, storeId);
  }

  deleteById(id: string) {
    return this.repository.deleteById(id);
  }

  upsertBudget(upsertBudget: IUpsertBudget) {
    return this.repository.upsert(upsertBudget);
  }
}
