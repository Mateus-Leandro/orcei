import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { ProductTable } from '../../components/product-table/product-table';
import { IProduct, IProductView } from '../../../../core/models/product/product.model';
import { ProductService } from '../../../../core/services/product/product.service';
import { StoreService } from '../../../../core/services/stores/store.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Router } from '@angular/router';
import { sortBySearchRelevance } from '../../../../shared/helpers/search-ranking.helper';

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

  private dialog = inject(MatDialog);
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

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  loadProducts(event: { page: number; limit: number }, searchText: string = ''): void {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    const storeId = this.storeService.selectedStore()?.id;

    this.productService.findAll(event.page, event.limit, searchText, storeId).subscribe({
      next: (response: any) => {
        this.products.set(
          sortBySearchRelevance(response.data ?? [], searchText, (product: IProductView) => [
            product.code,
            product.name,
          ]),
        );
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

  onDelete(row: { id?: string; Nome?: string }): void {
    if (!row?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Excluir produto',
        message: `Deseja excluir permanentemente o produto "${row.Nome ?? ''}"?`.trim(),
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.productService.deleteById(row.id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Produto excluido com sucesso!');
          this.loadProducts(
            { page: this.currentPage, limit: this.currentLimit },
            this.currentSearch,
          );
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao excluir produto: ${err.message || err}`);
        },
      });
    });
  }
}
