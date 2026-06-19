import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { LoadingService } from '../../services/loading/loading.service';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { finalize, from, map } from 'rxjs';
import { IBudgetProduct, IBudgetView, IUpsertBudget } from '../../models/budget/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetRepository {
  private supabase: SupabaseClient;

  constructor(
    private loadingService: LoadingService,
    private supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.supabase;
  }

  findAll(page: number = 1, limit: number = 10, search: string = '', storeId?: string) {
    this.loadingService.show();

    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = this.supabase
      .from('budgets')
      .select(
        '*, customer:customers!inner(id, name, surname), budgets_products(quantity, unit_price)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (search?.trim()) {
      query = query.ilike('customer.name', `%${search.trim()}%`);
    }

    return from(query).pipe(
      map(({ data, count, error }) => {
        if (error) {
          throw error;
        }

        const mappedData: IBudgetView[] = (data || []).map((item) =>
          this.mapBudgetView(item, item.budgets_products || []),
        );

        return {
          data: mappedData,
          count: count ?? 0,
        };
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  findById(id: string) {
    this.loadingService.show();

    const query = this.supabase
      .from('budgets')
      .select(
        '*, customer:customers(id, code, name, surname, document, phone, address, created_at, updated_at), ' +
          'budgets_products(id, product_id, quantity, unit_price, product:products(id, code, name, sale_unit))',
      )
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

        const row: any = data;

        const products: IBudgetProduct[] = (row.budgets_products || []).map((bp: any) => ({
          id: bp.id,
          budgetId: row.id,
          productId: bp.product_id,
          productName: bp.product?.name ?? '',
          saleUnit: bp.product?.sale_unit ?? '',
          quantity: bp.quantity ?? 0,
          unitPrice: bp.unit_price ?? 0,
        }));

        return {
          data: this.mapBudgetView(row, row.budgets_products || [], products),
          count: count ?? 0,
        };
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  upsert(budget: IUpsertBudget) {
    this.loadingService.show();

    const request = (async () => {
      const { data: budgetRow, error: budgetError } = await this.supabase
        .from('budgets')
        .upsert({
          id: budget.id,
          customer_id: budget.customerId,
          store_id: budget.storeId,
          observation: budget.observation,
          delivery_forecast: budget.deliveryForecast,
        })
        .select()
        .single();

      if (budgetError) throw new Error(budgetError.message);

      const budgetId = budgetRow.id;

      // Os itens são sincronizados por substituição: remove os atuais e reinsere
      // a lista enviada (cobre criação e edição sem precisar diferenciar linhas).
      const { error: deleteError } = await this.supabase
        .from('budgets_products')
        .delete()
        .eq('budget_id', budgetId);

      if (deleteError) throw new Error(deleteError.message);

      if (budget.products?.length) {
        const rows = budget.products.map((product) => ({
          budget_id: budgetId,
          product_id: product.productId,
          quantity: product.quantity,
          unit_price: product.unitPrice,
        }));

        const { error: insertError } = await this.supabase.from('budgets_products').insert(rows);

        if (insertError) throw new Error(insertError.message);
      }

      return budgetRow;
    })();

    return from(request).pipe(finalize(() => this.loadingService.hide()));
  }

  deleteById(id: string) {
    this.loadingService.show();

    return from(this.supabase.from('budgets').delete().eq('id', id)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      finalize(() => this.loadingService.hide()),
    );
  }

  private mapBudgetView(
    item: any,
    rawProducts: any[],
    products: IBudgetProduct[] = [],
  ): IBudgetView {
    const totalValue = rawProducts.reduce(
      (acc, product) => acc + (product.quantity ?? 0) * (product.unit_price ?? product.unitPrice ?? 0),
      0,
    );

    const customer = item.customer;
    const customerName = customer
      ? `${customer.name ?? ''}${customer.surname ? ` ${customer.surname}` : ''}`.trim()
      : '';

    return {
      id: item.id,
      customerId: item.customer_id,
      storeId: item.store_id,
      observation: item.observation ?? undefined,
      deliveryForecast: item.delivery_forecast ?? undefined,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      customer: customer
        ? {
            id: customer.id,
            code: customer.code,
            name: customer.name,
            surname: customer.surname,
            document: customer.document,
            phone: customer.phone,
            address: customer.address,
            createdAt: customer.created_at,
            updatedAt: customer.updated_at,
          }
        : undefined,
      customerName,
      totalProducts: rawProducts.length,
      totalValue,
      products,
    };
  }
}
