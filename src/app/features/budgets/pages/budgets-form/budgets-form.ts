import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime } from 'rxjs';
import { ButtonComponent } from '../../../../shared/components/button/button';
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
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = parseFloat(
    String(control.value ?? '')
      .replace(/\./g, '')
      .replace(',', '.'),
  );
  return value > 0 ? null : { positiveNumber: true };
}

@Component({
  selector: 'app-budgets-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    EntityFormComponent,
    FormFieldComponent,
    BudgetProductsTable,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgxMaskDirective,
    Spinner,
    CurrencyFormatPipe,
  ],
  templateUrl: './budgets-form.html',
  styleUrl: './budgets-form.scss',
})
export class BudgetsForm implements OnInit, OnDestroy {
  formGroup: FormGroup;
  budgetId: string | null = null;
  private storeId: string | null = null;
  loading = inject(LoadingService).loading;

  @ViewChild('customerSearchInput') customerSearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('productSearchInput') productSearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('quantityInput') quantityInput?: ElementRef<HTMLInputElement>;
  @ViewChild('unitPriceInput') unitPriceInput?: ElementRef<HTMLInputElement>;

  customerSearchControl = new FormControl<ICustomer | string | null>('');
  productSearchControl = new FormControl<IProductView | string | null>('');

  private dateFormatPipe = new DateFormatPipe();

  // Datas do orçamento (somente leitura, exibidas apenas na edição).
  budgetCreatedAtControl = new FormControl<string>({ value: '', disabled: true });
  budgetUpdatedAtControl = new FormControl<string>({ value: '', disabled: true });

  // Informações do cliente exibidas apenas para leitura.
  customerDocumentControl = new FormControl<string>({ value: '', disabled: true });
  customerPhoneControl = new FormControl<string>({ value: '', disabled: true });
  customerAddressControl = new FormControl<string>({ value: '', disabled: true });

  productForm = new FormGroup({
    quantity: new FormControl<string>(
      { value: '', disabled: true },
      { validators: positiveNumberValidator },
    ),
    unitPrice: new FormControl<string>(
      { value: '', disabled: true },
      { validators: positiveNumberValidator },
    ),
  });

  selectedCustomer = signal<ICustomer | null>(null);
  selectedProduct = signal<IProductView | null>(null);
  customerOptions = signal<ICustomer[]>([]);
  productOptions = signal<IProductView[]>([]);
  budgetProducts = signal<IBudgetProduct[]>([]);
  quantityMask = computed(() =>
    this.selectedProduct()?.isFractional ? 'separator.2' : 'separator.0',
  );

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
      budgetNumber: [''],
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

      this.productService.findAll(1, 10, value, this.storeService.selectedStore()?.id).subscribe({
        next: (response: any) => this.productOptions.set(response.data ?? []),
      });
    });
  }

  ngOnInit(): void {
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
            budgetNumber: budget.budgetNumber,
            observation: budget.observation ?? '',
            deliveryForecast: budget.deliveryForecast ?? '',
          });

          this.budgetCreatedAtControl.setValue(this.dateFormatPipe.transform(budget.createdAt));
          this.budgetUpdatedAtControl.setValue(this.dateFormatPipe.transform(budget.updatedAt));

          if (budget.customer) {
            this.selectedCustomer.set(budget.customer);
            this.customerSearchControl.setValue(budget.customer, { emitEvent: false });
            this.setCustomerInfo(budget.customer);
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
    this.setCustomerInfo(customer);
  }

  onClearCustomer(): void {
    this.selectedCustomer.set(null);
    this.customerSearchControl.setValue('', { emitEvent: false });
    this.customerOptions.set([]);
    this.setCustomerInfo(null);
    setTimeout(() => this.customerSearchInput?.nativeElement.focus(), 0);
  }

  private setCustomerInfo(customer: ICustomer | null): void {
    this.customerDocumentControl.setValue(customer?.document ?? '');
    this.customerPhoneControl.setValue(customer?.phone ?? '');
    this.customerAddressControl.setValue(customer?.address ?? '');
  }

  displayProduct = (product: IProductView | string | null): string => {
    if (!product || typeof product === 'string') {
      return '';
    }
    return `${product.code} - ${product.name}`;
  };

  onProductSelected(product: IProductView): void {
    if (this.budgetProducts().some((item) => item.productId === product.id)) {
      this.notificationService.showError('Produto já adicionado ao orçamento.');
      this.resetProductSelection();
      return;
    }

    this.selectedProduct.set(product);
    this.productSearchControl.setValue(product, { emitEvent: false });
    this.productOptions.set([]);

    this.productForm.enable({ emitEvent: false });
    this.quantityControl.setValue(this.formatNumber(1, product.isFractional ? 2 : 0), {
      emitEvent: false,
    });

    const salePrice = product.financialStatement?.salePrice ?? 0;
    this.unitPriceControl.setValue(salePrice > 0 ? this.formatNumber(salePrice, 2) : '', {
      emitEvent: false,
    });

    setTimeout(() => this.quantityInput?.nativeElement.focus(), 0);
  }

  onProductSearchEnter(event: Event): void {
    const options = this.productOptions();
    if (options.length === 1) {
      event.preventDefault();
      this.onProductSelected(options[0]);
    }
  }

  onClearProduct(): void {
    this.resetProductSelection();
    setTimeout(() => this.productSearchInput?.nativeElement.focus(), 0);
  }

  focusUnitPrice(event: Event): void {
    event.preventDefault();
    this.unitPriceInput?.nativeElement.focus();
  }

  onAddProduct(event?: Event): void {
    event?.preventDefault();

    const product = this.selectedProduct();
    if (!product) {
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const quantity = this.toNumber(this.quantityControl.value);
    const unitPrice = this.toNumber(this.unitPriceControl.value);

    const newProduct: IBudgetProduct = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      saleUnit: product.saleUnit,
      isFractional: product.isFractional,
      quantity,
      unitPrice,
    };

    this.budgetProducts.update((products) => [...products, newProduct]);
    this.resetProductSelection();
    setTimeout(() => this.productSearchInput?.nativeElement.focus(), 0);
  }

  private resetProductSelection(): void {
    this.selectedProduct.set(null);
    this.productSearchControl.setValue('', { emitEvent: false });
    this.productOptions.set([]);
    this.productForm.reset({ quantity: '', unitPrice: '' }, { emitEvent: false });
    this.productForm.disable({ emitEvent: false });
  }

  get quantityControl(): FormControl<string | null> {
    return this.productForm.controls.quantity;
  }

  get unitPriceControl(): FormControl<string | null> {
    return this.productForm.controls.unitPrice;
  }

  canAddProduct(): boolean {
    return !!this.selectedProduct() && this.productForm.valid;
  }

  private formatNumber(value: number, decimals: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false,
    });
  }

  private toNumber(value: string | null | undefined): number {
    return (
      parseFloat(
        String(value ?? '')
          .replace(/\./g, '')
          .replace(',', '.'),
      ) || 0
    );
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

  get budgetNumberControl() {
    return this.formGroup.get('budgetNumber') as FormControl<string>;
  }

  get observationControl() {
    return this.formGroup.get('observation') as FormControl<string>;
  }

  get deliveryForecastControl() {
    return this.formGroup.get('deliveryForecast') as FormControl<string>;
  }
}
