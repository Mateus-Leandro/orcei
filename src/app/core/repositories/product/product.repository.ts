import { Injectable } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import { IProduct, IProductView, IUpsertProduct } from '../../models/product/product.model';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { from } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

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

  upsert(upsertProduct: IUpsertProduct) {
    this.loadingService.show();

    return from(
      this.supabase
        .from('products')
        .upsert(upsertProduct, {
          onConflict: 'id',
        })
        .select()
        .single(),
    ).pipe(finalize(() => this.loadingService.hide()));
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase
      .from('products')
      .select('*, barcodes(id, ean)')
      .eq('id', id)
      .maybeSingle();

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        if (!data) {
          return {
            data: null,
            count: 0,
          };
        }

        const mappedData: IProductView = {
          id: data.id,
          code: data.code,
          name: data.name,
          barcodes: data?.barcodes || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        return {
          data: mappedData,
          count: count ?? 0,
        };
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  findAll(page: number = 1, limit: number = 10, search: string = '') {
    this.loadingService.show();

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = this.supabase
      .from('products')
      .select('*, barcodes(id, ean)', { count: 'exact' })
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

        const mappedData: IProductView[] = (data || []).map(
          (item): IProductView => ({
            id: item.id,
            code: item.code,
            name: item.name,
            barcodes: item?.barcodes || [],
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
