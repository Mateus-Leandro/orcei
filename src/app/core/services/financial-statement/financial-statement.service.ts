import { Injectable } from '@angular/core';
import { FinancialStatementRepository } from '../../repositories/financial-statement/financial-statement.repository';
import { IUpsertFinancialStatement } from '../../models/financial-statement/financial-statement.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialStatementService {
  constructor(private repository: FinancialStatementRepository) {}

  upsert(statement: IUpsertFinancialStatement) {
    return this.repository.upsert(statement);
  }
}
