import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { SellersService } from '../../../../core/services/sellers/sellers.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { IUpsertSeller } from '../../../../core/models/sellers/sellers.model';

@Component({
  selector: 'app-sellers-form',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    EntityFormComponent,
    Spinner,
    MatCheckboxModule,
  ],
  templateUrl: './sellers-form.html',
  styleUrl: './sellers-form.scss',
})
export class SellersForm implements OnInit {
  formGroup: FormGroup;
  sellerId: string | null = null;
  loading = inject(LoadingService).loading;

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private sellersService: SellersService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formGroup = fb.group({
      code: [''],
      name: ['', [Validators.required]],
      active: [true],
    });

    this.sellerId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.sellerId) {
      this.sellersService.findById(this.sellerId).subscribe({
        next: (seller) => {
          this.formGroup.patchValue({
            code: seller.data?.code,
            name: seller.data?.name,
            active: seller.data?.active,
          });
        },
        error: (err) => {
          this.notificationService.showError(
            `Erro ao obter informações do vendedor: ${err.message || err}`,
          );
          return this.router.navigate(['/sellers']);
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

    const upsertSeller: IUpsertSeller = {
      id: this.sellerId || undefined,
      name: payload.name,
      active: payload.active ?? true,
    };

    this.sellersService.upsertSeller(upsertSeller).subscribe({
      next: () => {
        this.notificationService.showSuccess('Vendedor salvo com sucesso!');
        this.router.navigate(['/sellers']);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao salvar vendedor: ${error.message || error}`);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/sellers']);
  }

  get codeControl() {
    return this.formGroup.get('code') as FormControl<string>;
  }

  get nameControl() {
    return this.formGroup.get('name') as FormControl<string>;
  }

  get activeControl() {
    return this.formGroup.get('active') as FormControl<boolean>;
  }
}
