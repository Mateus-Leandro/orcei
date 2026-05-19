import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { IFinancialStatement } from '../../models/financial-statement/financial-statement.model';

@Injectable({
  providedIn: 'root',
})
export class ProductRepository {
  private supabase: SupabaseClient;

  constructor(
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  findAll(page: number = 1, limit: number = 10, search: string = '') {
    this.loadingService.show();

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = this.supabase
      .from('financial_statement')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (search?.trim()) {
      query = query.ilike('search_text', `%${search.trim()}%`);
    }

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        const mappedData: IFinancialStatement[] = (data || []).map(
          (item): IFinancialStatement => ({
            id: item.id,
            companyId: item.company_id,
            storeId: item.store_id,
            productId: item.product_id,
            costPrice: item.cost_price,
            margin: item.margin,
            salePrice: item.sale_price,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }),
        );

        return {
          data: mappedData,
          count: count ?? 0,
        };
      }),
      finalize(() => this.loadingService.hide()),
    );
  }
}
