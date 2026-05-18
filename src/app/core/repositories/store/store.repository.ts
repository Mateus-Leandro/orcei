import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { IProductView } from '../../models/product/product.model';
import { IStore, IStoreView } from '../../models/store/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreRepository {
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
      .from('stores')
      .select('*', { count: 'exact' })
      .order('store_number')
      .range(fromIndex, toIndex);

    if (search?.trim()) {
      query = query.ilike('search_text', `%${search.trim()}%`);
    }

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        const mappedData: IStoreView[] = (data || []).map(
          (item): IStoreView => ({
            id: item.id,
            storeNumber: item.store_number,
            name: item.name,
            cnpj: item.cnpj,
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
