import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { ProductTable } from '../../components/product-table/product-table';
import { IProduct, IProductView } from '../../../../core/models/product/product.model';
import { ProductService } from '../../../../core/services/product/product.service';
import { StoreService } from '../../../../core/services/stores/store.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CardContainer, ProductTable, Spinner],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products {
  form: FormGroup;
  products = signal<IProductView[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';
  private previousStoreId: string | null | undefined;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private storeService: StoreService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      search: [''],
    });

    effect(() => {
      const storeId = this.storeService.selectedStore()?.id ?? null;
      const isStoreChange = this.previousStoreId !== undefined && this.previousStoreId !== storeId;
      this.previousStoreId = storeId;

      if (isStoreChange) {
        this.currentPage = 1;
        this.currentSearch = '';
        this.form.get('search')?.setValue('', { emitEvent: false });
      }

      this.loadProducts({ page: this.currentPage, limit: this.currentLimit }, this.currentSearch);
    });
  }

  get searchControl(): FormControl {
    return this.form.get('search') as FormControl;
  }

  loadProducts(event: { page: number; limit: number }, searchText: string = ''): void {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    const storeId = this.storeService.selectedStore()?.id;

    this.productService.findAll(event.page, event.limit, searchText, storeId).subscribe({
      next: (response: any) => {
        this.products.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar Produtos: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadProducts(
      {
        page: 1,
        limit: 10,
      },
      value,
    );
  }

  navigateToProductForm(product?: IProduct) {
    return this.router.navigate([`products/form${product?.id ? `/${product.id}` : ''}`]);
  }
}
