import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { IStore, IStoreView, IUpsertStore } from '../../models/store/store.model';

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

  upsert(data: IUpsertStore) {
    this.loadingService.show();

    const request = this.supabase
      .from('stores')
      .upsert({
        id: data.id,
        store_number: data.storeNumber,
        name: data.name,
        cnpj: data.cnpj.replace(/\D/g, ''),
        phone: data.phone,
      })
      .select()
      .single()
      .then(({ data: result, error }) => {
        if (error) {
          if (error.code === '23505') {
            throw new Error('CNPJ ou número de loja já cadastrado para esta empresa.');
          }
          throw new Error(error.message);
        }
        return result;
      });

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase.from('stores').select('*').eq('id', id).maybeSingle();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (!data) return null;

        const mapped: IStoreView = {
          id: data.id,
          storeNumber: data.store_number,
          name: data.name,
          cnpj: data.cnpj,
          phone: data.phone,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        return mapped;
      }),
      finalize(() => this.loadingService.hide()),
    );
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
            phone: item.phone,
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
