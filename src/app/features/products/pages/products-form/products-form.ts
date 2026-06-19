import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product/product.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Select } from '../../../../shared/components/select/select';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { BarcodeProductTable } from '../../components/barcode-product-table/barcode-product-table';
import {
  IUpsertProduct,
  PRODUCT_SALE_UNIT_OPTIONS,
} from '../../../../core/models/product/product.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { IBarcodeEanAndId } from '../../../../core/models/barcode/barcode.model';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { BarcodeDialog } from '../../components/barcode-dialog/barcode-dialog';
import { FinancialStatementTable, IFinancialStatementCellChange } from '../../components/financial-statement-table/financial-statement-table';
import { IFinancialStatementView } from '../../../../core/models/financial-statement/financial-statement.model';
import { FinancialStatementService } from '../../../../core/services/financial-statement/financial-statement.service';
import { StoreService } from '../../../../core/services/stores/store.service';
import { IStoreView } from '../../../../core/models/store/store.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products-form',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    EntityFormComponent,
    BarcodeProductTable,
    FinancialStatementTable,
    MatCheckboxModule,
    Select,
    Spinner,
  ],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
})
export class ProductsForm implements OnInit, OnDestroy {
  formGroup: FormGroup;
  productId: string | null = null;
  displayColumns = ['Código'];
  saleUnitOptions = PRODUCT_SALE_UNIT_OPTIONS;
  loading = inject(LoadingService).loading;
  financialStatements = signal<IFinancialStatementView[]>([]);
  private dialog = inject(MatDialog);

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private notificationService: NotificationService,
    private financialStatementService: FinancialStatementService,
    private storeService: StoreService,
    private router: Router,
  ) {
    this.formGroup = fb.group({
      code: ['', []],
      name: ['', [Validators.required]],
      saleUnit: ['UN', [Validators.required]],
      isFractional: [false, []],
      barcodes: [[], []],
    });

    this.productId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.storeService.lockSelection();

    if (this.productId) {
      forkJoin({
        product: this.productService.findById(this.productId),
        stores: this.storeService.findAll(1, 999, ''),
      }).subscribe({
        next: ({ product, stores }) => {
          this.formGroup.patchValue({
            code: product.data?.code,
            name: product.data?.name,
            saleUnit: product.data?.saleUnit ?? 'UN',
            isFractional: product.data?.isFractional ?? false,
            barcodes: product.data?.barcodes,
          });
          this.financialStatements.set(
            this.buildStatementsForAllStores(product.data?.financialStatements ?? [], stores.data),
          );
        },
        error: (err) => {
          this.notificationService.showError(
            `Erro ao obter informações do produto: ${err.message || err}`,
          );
          return this.router.navigate(['/products']);
        },
      });
    }
  }

  private buildStatementsForAllStores(
    statements: IFinancialStatementView[],
    stores: IStoreView[],
  ): IFinancialStatementView[] {
    return stores.map((store) => {
      const existing = statements.find((statement) => statement.storeId === store.id);

      if (existing) {
        return { ...existing, storeName: existing.storeName || store.name };
      }

      return {
        id: '',
        companyId: '',
        storeId: store.id,
        productId: this.productId ?? '',
        margin: '0',
        costPrice: 0,
        salePrice: 0,
        createdAt: '',
        updatedAt: '',
        storeName: store.name,
      };
    });
  }

  ngOnDestroy(): void {
    this.storeService.unlockSelection();
  }

  onFinancialStatementCellChange(change: IFinancialStatementCellChange): void {
    const statement = this.financialStatements().find((s) => s.storeId === change.storeId);
    if (!statement) return;

    this.financialStatementService
      .upsert({
        id: statement.id,
        storeId: statement.storeId,
        productId: statement.productId,
        [change.field]: change.value,
      })
      .subscribe({
        error: (error) => {
          this.notificationService.showError(
            `Erro ao salvar ficha financeira: ${error.message || error}`,
          );
        },
      });
  }

  onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = this.formGroup.getRawValue();

    const isNewProduct = !this.productId;

    const upsertProduct: IUpsertProduct = {
      id: this?.productId || undefined,
      name: payload.name,
      saleUnit: payload.saleUnit,
      isFractional: payload.isFractional,
    };

    this.productService.upsertProduct(upsertProduct).subscribe({
      next: (product) => {
        this.notificationService.showSuccess('Produto salvo com sucesso!');

        if (isNewProduct && product?.id) {
          this.router.navigate(['products/form', product.id]);
          return;
        }

        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao salvar produto: ${error}`);
      },
    });
  }

  addBarcode() {
    const dialogRef = this.dialog.open(BarcodeDialog, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((barcode) => {
      if (!barcode || !this.productId) return;

      this.productService
        .addBarcode({
          productId: this.productId,
          barcode: barcode,
        })
        .subscribe({
          next: (newBarcode) => {
            const currentBarcodes = this.barcodesControl.value || [];
            this.barcodesControl.setValue([...currentBarcodes, newBarcode]);
            this.notificationService.showSuccess('Código de barras vinculado corretamente!');
          },
          error: (error) => {
            this.notificationService.showError(`Erro: ${error.message || error}`);
          },
        });
    });
  }

  removeBarcode(barcode: IBarcodeEanAndId) {
    this.productService.deleteBarcodeById(barcode.id).subscribe({
      next: () => {
        const currentBarcodes = this.barcodesControl.value || [];

        const updatedBarcodes = currentBarcodes.filter(
          (element: IBarcodeEanAndId) => element.id !== barcode.id,
        );

        this.barcodesControl.setValue(updatedBarcodes);

        this.notificationService.showSuccess(
          `Código de barras ${barcode.ean} removido do produto.`,
        );
      },
      error: (error) => {
        this.notificationService.showError(
          `Erro ao remover código de barras ${barcode.ean} do produto: ${error}`,
        );
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  get codeControl() {
    return this.formGroup.get('code') as FormControl<string>;
  }

  get nameControl() {
    return this.formGroup.get('name') as FormControl<string>;
  }

  get saleUnitControl() {
    return this.formGroup.get('saleUnit') as FormControl<string>;
  }

  get isFractionalControl() {
    return this.formGroup.get('isFractional') as FormControl<boolean>;
  }

  get barcodesControl() {
    return this.formGroup.get('barcodes') as FormControl<IBarcodeEanAndId[]>;
  }
}
