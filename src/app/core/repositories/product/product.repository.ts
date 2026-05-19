import { Injectable } from '@angular/core';
import { LoadingService } from '../../services/loading/loading.service';
import {
  IAddBarcode,
  IProduct,
  IProductView,
  IUpsertProduct,
} from '../../models/product/product.model';
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

    const request = this.supabase
      .from('products')
      .upsert({
        id: upsertProduct.id,
        name: upsertProduct.name,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) throw new Error(error.message);
        return data;
      });

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase
      .from('products')
      .select('*, barcodes(id, ean), financialStatement:financial_statement(*)')
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
          financialStatement: data?.financialStatement[0],
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
      .select('*, barcodes(id, ean), financialStatement:financial_statement(*)', { count: 'exact' })
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
            financialStatement: {
              ...item?.financialStatement[0],
              margin: item?.financialStatement[0]?.margin || 0,
              costPrice: item?.financialStatement[0]?.cost_price || 0,
              salePrice: item?.financialStatement[0]?.sale_price || 0,
            },
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

  deleteBarcodeById(id: string) {
    this.loadingService.show();

    return from(this.supabase.from('barcodes').delete().eq('id', id)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  addBarcode(addBarcodeData: IAddBarcode) {
    this.loadingService.show();

    const barcode = addBarcodeData?.barcode?.trim();

    return from(
      this.supabase
        .from('barcodes')
        .insert({
          product_id: addBarcodeData?.productId,
          ean: barcode,
        })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            if (error.code === '23505') {
              throw new Error('Código de barras já cadastrado em algum produto!');
            }

            throw new Error(error.message);
          }

          return data;
        }),
    ).pipe(finalize(() => this.loadingService.hide()));
  }
}
