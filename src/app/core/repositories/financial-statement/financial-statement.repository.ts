import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { from } from 'rxjs';
import { IUpsertFinancialStatement } from '../../models/financial-statement/financial-statement.model';

@Injectable({
  providedIn: 'root',
})
export class FinancialStatementRepository {
  private supabase: SupabaseClient;

  constructor(
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  upsert(statement: IUpsertFinancialStatement) {
    const payload: Record<string, any> = {
      store_id: statement.storeId,
      product_id: statement.productId,
    };

    if (statement.id) payload['id'] = statement.id;
    if (statement.margin != null) payload['margin'] = statement.margin;
    if (statement.costPrice != null) payload['cost_price'] = statement.costPrice;
    if (statement.salePrice != null) payload['sale_price'] = statement.salePrice;

    return from(
      this.supabase
        .from('financial_statement')
        .upsert(payload, { onConflict: 'product_id,company_id,store_id' })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw new Error(error.message);
          return data;
        }),
    );
  }
}
