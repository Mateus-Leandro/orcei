import { Component, inject, OnInit, signal } from '@angular/core';
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
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { BarcodeProductTable } from '../../components/barcode-product-table/barcode-product-table';
import { IUpsertProduct } from '../../../../core/models/product/product.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { IBarcodeEanAndId } from '../../../../core/models/barcode/barcode.model';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { BarcodeDialog } from '../../components/barcode-dialog/barcode-dialog';

@Component({
  selector: 'app-products-form',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    EntityFormComponent,
    BarcodeProductTable,
    Spinner,
  ],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
})
export class ProductsForm implements OnInit {
  formGroup: FormGroup;
  productId: string | null = null;
  displayColumns = ['Código'];
  loading = inject(LoadingService).loading;
  private dialog = inject(MatDialog);

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formGroup = fb.group({
      code: ['', []],
      name: ['', [Validators.required]],
      barcodes: [[], []],
    });

    this.productId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.productId) {
      this.productService.findById(this.productId).subscribe({
        next: (product) => {
          this.formGroup.patchValue({
            code: product.data?.code,
            name: product.data?.name,
            barcodes: product.data?.barcodes,
          });
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

  onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = this.formGroup.getRawValue();

    const upsertProduct: IUpsertProduct = {
      id: this?.productId || undefined,
      name: payload.name,
    };

    this.productService.upsertProduct(upsertProduct).subscribe({
      next: () => {
        this.notificationService.showSuccess('Produto salvo com sucesso!');
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

  get barcodesControl() {
    return this.formGroup.get('barcodes') as FormControl<IBarcodeEanAndId[]>;
  }
}
