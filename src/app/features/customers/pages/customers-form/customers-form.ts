import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { CustomersService } from '../../../../core/services/customers/customers.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { IUpsertCustomer } from '../../../../core/models/customers/customers.model';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-customers-form',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    EntityFormComponent,
    Spinner,
    MatCheckboxModule,
  ],
  templateUrl: './customers-form.html',
  styleUrl: './customers-form.scss',
})
export class CustomersForm implements OnInit {
  formGroup: FormGroup;
  customerId: string | null = null;
  loading = inject(LoadingService).loading;

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private customersService: CustomersService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.formGroup = fb.group({
      code: ['', []],
      name: ['', [Validators.required]],
      surname: ['', []],
      document: ['', []],
      phone: ['', []],
      address: ['', []],
      blocked: [false, []],
    });

    this.customerId = this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.customerId) {
      this.customersService.findById(this.customerId).subscribe({
        next: (customer) => {
          this.formGroup.patchValue({
            code: customer.data?.code,
            name: customer.data?.name,
            surname: customer.data?.surname,
            document: customer.data?.document,
            phone: customer.data?.phone,
            address: customer.data?.address,
            blocked: customer.data?.blocked,
          });
        },
        error: (err) => {
          this.notificationService.showError(
            `Erro ao obter informações do cliente: ${err.message || err}`,
          );
          return this.router.navigate(['/customers']);
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

    const upsertCustomer: IUpsertCustomer = {
      id: this?.customerId || undefined,
      name: payload.name,
      surname: payload.surname || undefined,
      document: payload.document || undefined,
      phone: payload.phone || undefined,
      address: payload.address || undefined,
      blocked: payload.blocked || false,
    };

    this.customersService.upsertCustomer(upsertCustomer).subscribe({
      next: () => {
        this.notificationService.showSuccess('Cliente salvo com sucesso!');
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao salvar cliente: ${error.message || error}`);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }

  get codeControl() {
    return this.formGroup.get('code') as FormControl<string>;
  }

  get nameControl() {
    return this.formGroup.get('name') as FormControl<string>;
  }

  get surnameControl() {
    return this.formGroup.get('surname') as FormControl<string>;
  }

  get documentControl() {
    return this.formGroup.get('document') as FormControl<string>;
  }

  get phoneControl() {
    return this.formGroup.get('phone') as FormControl<string>;
  }

  get addressControl() {
    return this.formGroup.get('address') as FormControl<string>;
  }

  get blockedControl() {
    return this.formGroup.get('blocked') as FormControl<boolean>;
  }
}
