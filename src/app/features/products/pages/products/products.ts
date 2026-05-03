import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { ProductTable } from '../../components/product-table/product-table';
import { IProduct } from '../../../../core/models/product/product.model';
import { ProductService } from '../../../../core/services/product/product.service';
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
export class Products implements OnInit {
  form: FormGroup;
  products = signal<IProduct[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts({
      page: 1,
      limit: 10,
    });
  }

  get searchControl(): FormControl {
    return this.form.get('search') as FormControl;
  }

  loadProducts(event: { page: number; limit: number }, searchText: string = ''): void {
    this.productService.findAll(event.page, event.limit, searchText).subscribe({
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
