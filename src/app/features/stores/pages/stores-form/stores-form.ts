import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { StoreService } from '../../../../core/services/stores/store.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';

@Component({
  selector: 'app-stores-form',
  imports: [ReactiveFormsModule, FormFieldComponent, Spinner, EntityFormComponent],
  templateUrl: './stores-form.html',
  styleUrl: './stores-form.scss',
})
export class StoresForm implements OnInit {
  form: FormGroup;
  storeId: string | null = null;
  loading = inject(LoadingService).loading;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private storeService: StoreService,
    private notificationService: NotificationService,
  ) {
    this.form = this.fb.group({
      storeNumber: [null],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', []],
    });
  }

  ngOnInit(): void {
    this.storeId = this.route.snapshot.paramMap.get('id');

    if (this.storeId) {
      this.storeService.findById(this.storeId).subscribe({
        next: (store) => {
          if (!store) return;
          this.form.patchValue({
            storeNumber: store.storeNumber,
            cnpj: store.cnpj,
            name: store.name,
            phone: store.phone ?? '',
          });
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao carregar loja: ${err.message || err}`);
        },
      });
    }
  }

  get storeNumberControl(): FormControl {
    return this.form.get('storeNumber') as FormControl;
  }

  get cnpjControl(): FormControl {
    return this.form.get('cnpj') as FormControl;
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get phoneControl(): FormControl {
    return this.form.get('phone') as FormControl;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { storeNumber, cnpj, name, phone } = this.form.value;

    this.storeService
      .upsert({
        id: this.storeId ?? undefined,
        storeNumber: storeNumber ? Number(storeNumber) : null,
        cnpj,
        name,
        phone: phone,
      })
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Loja salva com sucesso!');
          this.router.navigate(['/stores']);
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao salvar loja: ${err.message || err}`);
        },
      });
  }

  goBack(): void {
    this.location.back();
  }
}
