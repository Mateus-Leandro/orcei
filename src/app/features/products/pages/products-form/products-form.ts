import { Component, OnInit } from '@angular/core';
import { ContainerPageLayout } from '../../../../layouts/container-page-layout/container-page-layout';
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
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-products-form',
  imports: [
    ContainerPageLayout,
    FormFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    ButtonComponent,
  ],
  templateUrl: './products-form.html',
  styleUrl: './products-form.scss',
})
export class ProductsForm implements OnInit {
  formGroup: FormGroup;
  productId: string | null = null;

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
      barcode: ['', [Validators.maxLength(14)]],
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
            barcode: product.data?.barcode,
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

    const payload = this.formGroup.value;

    if (this.productId) {
    } else {
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  get codeControl() {
    return this.formGroup.get('code') as FormControl;
  }

  get nameControl() {
    return this.formGroup.get('name') as FormControl;
  }

  get barcodeControl() {
    return this.formGroup.get('barcode') as FormControl;
  }
}
