import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { ISeller, IUpsertSeller } from '../../models/sellers/sellers.model';

@Injectable({
  providedIn: 'root',
})
export class SellersRepository {
  private supabase: SupabaseClient;

  constructor(
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  upsert(upsertSeller: IUpsertSeller) {
    this.loadingService.show();

    const request = this.supabase
      .from('sellers')
      .upsert({
        id: upsertSeller.id,
        name: upsertSeller.name,
        active: upsertSeller.active,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }

        return data;
      });

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase.from('sellers').select('*').eq('id', id).maybeSingle();

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

        return {
          data: this.mapSeller(data),
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
      .from('sellers')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(fromIndex, toIndex);

    const term = search?.trim();

    if (term) {
      query = /^\d+$/.test(term)
        ? query.or(`code.eq.${term},name.ilike.%${term}%`)
        : query.ilike('name', `%${term}%`);
    }

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        return {
          data: (data || []).map((item) => this.mapSeller(item)),
          count: count ?? 0,
        };
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  deleteById(id: string) {
    this.loadingService.show();

    return from(this.supabase.from('sellers').delete().eq('id', id)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  private mapSeller(item: any): ISeller {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      active: item.active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }
}
