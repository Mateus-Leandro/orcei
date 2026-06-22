import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { ICustomer, IUpsertCustomer } from '../../models/customers/customers.model';

@Injectable({
  providedIn: 'root',
})
export class CustomersRepository {
  private supabase: SupabaseClient;

  constructor(
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  upsert(upsertCustomer: IUpsertCustomer) {
    this.loadingService.show();

    const request = this.supabase
      .from('customers')
      .upsert({
        id: upsertCustomer.id,
        name: upsertCustomer.name,
        surname: upsertCustomer.surname,
        document: upsertCustomer.document,
        phone: upsertCustomer.phone,
        address: upsertCustomer.address,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um cliente com este documento!');
          }

          throw new Error(error.message);
        }

        return data;
      });

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase.from('customers').select('*').eq('id', id).maybeSingle();

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

        const mappedData: ICustomer = {
          id: data.id,
          code: data.code,
          name: data.name,
          surname: data.surname,
          phone: data.phone,
          address: data.address,
          document: data.document,
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
      .from('customers')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(fromIndex, toIndex);

    if (search?.trim()) {
      query = query.ilike('search_text', `%${search.trim()}%`);
    }

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        const mappedData: ICustomer[] = (data || []).map(
          (item): ICustomer => ({
            id: item.id,
            code: item.code,
            name: item.name,
            surname: item.surname,
            document: item.document,
            phone: item.phone,
            address: item.address,
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

  deleteById(id: string) {
    this.loadingService.show();

    return from(this.supabase.from('customers').delete().eq('id', id)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      finalize(() => this.loadingService.hide()),
    );
  }
}
