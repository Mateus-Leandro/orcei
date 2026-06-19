import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime } from 'rxjs';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import {
  BudgetProductsTable,
  IBudgetProductCellChange,
} from '../../components/budget-products-table/budget-products-table';
import { IBudgetProduct, IUpsertBudget } from '../../../../core/models/budget/budget.model';
import { ICustomer } from '../../../../core/models/customers/customers.model';
import { IProductView } from '../../../../core/models/product/product.model';
import { BudgetService } from '../../../../core/services/budget/budget.service';
import { CustomersService } from '../../../../core/services/customers/customers.service';
import { ProductService } from '../../../../core/services/product/product.service';
import { StoreService } from '../../../../core/services/stores/store.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';

@Component({
  selector: 'app-budgets-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EntityFormComponent,
    FormFieldComponent,
    BudgetProductsTable,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    Spinner,
  ],
  templateUrl: './budgets-form.html',
  styleUrl: './budgets-form.scss',
})
export class BudgetsForm implements OnInit, OnDestroy {
  formGroup: FormGroup;
  budgetId: string | null = null;
  private storeId: string | null = null;
  loading = inject(LoadingService).loading;

  customerSearchControl = new FormControl<ICustomer | string | null>('');
  productSearchControl = new FormControl<IProductView | string | null>('');

  selectedCustomer = signal<ICustomer | null>(null);
  customerOptions = signal<ICustomer[]>([]);
  productOptions = signal<IProductView[]>([]);
  budgetProducts = signal<IBudgetProduct[]>([]);

  totalProducts = computed(() => this.budgetProducts().length);
  totalValue = computed(() =>
    this.budgetProducts().reduce((acc, product) => acc + product.quantity * product.unitPrice, 0),
  );

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private budgetService: BudgetService,
    private customersService: CustomersService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private currencyFormatPipe: CurrencyFormatPipe,
    private storeService: StoreService,
    private router: Router,
  ) {
    this.formGroup = fb.group({
      observation: [''],
      deliveryForecast: [''],
    });

    this.budgetId = this.route.snapshot.paramMap.get('id');

    this.customerSearchControl.valueChanges.pipe(debounceTime(400)).subscribe((value) => {
      if (typeof value !== 'string' || !value.trim()) {
        this.customerOptions.set([]);
        return;
      }

      this.customersService.findAll(1, 10, value).subscribe({
        next: (response: any) => this.customerOptions.set(response.data ?? []),
      });
    });

    this.productSearchControl.valueChanges.pipe(debounceTime(400)).subscribe((value) => {
      if (typeof value !== 'string' || !value.trim()) {
        this.productOptions.set([]);
        return;
      }

      this.productService.findAll(1, 10, value).subscribe({
        next: (response: any) => this.productOptions.set(response.data ?? []),
      });
    });
  }

  ngOnInit(): void {
    // Trava a troca de loja na toolbar enquanto o orçamento está aberto.
    this.storeService.lockSelection();
    this.storeId = this.storeService.selectedStore()?.id ?? null;

    if (this.budgetId) {
      this.budgetService.findById(this.budgetId).subscribe({
        next: (response) => {
          const budget = response.data;
          if (!budget) {
            this.notificationService.showError('Orçamento não encontrado.');
            this.router.navigate(['/budgets']);
            return;
          }

          this.storeId = budget.storeId;

          this.formGroup.patchValue({
            observation: budget.observation ?? '',
            deliveryForecast: budget.deliveryForecast ?? '',
          });

          if (budget.customer) {
            this.selectedCustomer.set(budget.customer);
            this.customerSearchControl.setValue(budget.customer, { emitEvent: false });
          }

          this.budgetProducts.set(budget.products ?? []);
        },
        error: (err) => {
          this.notificationService.showError(
            `Erro ao obter informações do orçamento: ${err.message || err}`,
          );
          this.router.navigate(['/budgets']);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.storeService.unlockSelection();
  }

  displayCustomer = (customer: ICustomer | string | null): string => {
    if (!customer || typeof customer === 'string') {
      return '';
    }
    return `${customer.name ?? ''}${customer.surname ? ` ${customer.surname}` : ''}`.trim();
  };

  onCustomerSelected(customer: ICustomer): void {
    this.selectedCustomer.set(customer);
  }

  onProductSelected(product: IProductView): void {
    this.addProduct(product);
    this.productSearchControl.setValue('', { emitEvent: false });
    this.productOptions.set([]);
  }

  private addProduct(product: IProductView): void {
    const exists = this.budgetProducts().some((item) => item.productId === product.id);
    if (exists) {
      this.notificationService.showError('Produto já adicionado ao orçamento.');
      return;
    }

    const newProduct: IBudgetProduct = {
      productId: product.id,
      productName: product.name,
      saleUnit: product.saleUnit,
      quantity: 1,
      unitPrice: product.financialStatement?.salePrice ?? 0,
    };

    this.budgetProducts.update((products) => [...products, newProduct]);
  }

  onCellChange(change: IBudgetProductCellChange): void {
    this.budgetProducts.update((products) =>
      products.map((product) =>
        product.productId === change.productId
          ? { ...product, [change.field]: change.value }
          : product,
      ),
    );
  }

  onRemoveProduct(row: { productId: string }): void {
    this.budgetProducts.update((products) =>
      products.filter((product) => product.productId !== row.productId),
    );
  }

  onSave(): void {
    const customer = this.selectedCustomer();

    if (!customer) {
      this.notificationService.showError('Selecione um cliente para o orçamento.');
      return;
    }

    if (this.budgetProducts().length === 0) {
      this.notificationService.showError('Adicione ao menos um produto ao orçamento.');
      return;
    }

    const storeId = this.storeId ?? this.storeService.selectedStore()?.id;

    if (!storeId) {
      this.notificationService.showError('Selecione uma loja antes de salvar o orçamento.');
      return;
    }

    const payload = this.formGroup.getRawValue();

    const upsertBudget: IUpsertBudget = {
      id: this.budgetId || undefined,
      customerId: customer.id,
      storeId,
      observation: payload.observation || undefined,
      deliveryForecast: payload.deliveryForecast || undefined,
      products: this.budgetProducts(),
    };

    this.budgetService.upsertBudget(upsertBudget).subscribe({
      next: () => {
        this.notificationService.showSuccess('Orçamento salvo com sucesso!');
        this.router.navigate(['/budgets']);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao salvar orçamento: ${error.message || error}`);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/budgets']);
  }

  get totalValueFormatted(): string {
    return this.currencyFormatPipe.transform(this.totalValue());
  }

  get observationControl() {
    return this.formGroup.get('observation') as FormControl<string>;
  }

  get deliveryForecastControl() {
    return this.formGroup.get('deliveryForecast') as FormControl<string>;
  }
}
