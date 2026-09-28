import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ContainerPageLayout } from '../../../../layouts/container-page-layout/container-page-layout';
import { ISeller } from '../../../../core/models/sellers/sellers.model';
import { SellersService } from '../../../../core/services/sellers/sellers.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { DatePicker } from '../../../../shared/components/date-picker/date-picker';
import { Select } from '../../../../shared/components/select/select';
import { Utils } from '../../../../core/utils/utils';
import { CurrencyInput } from '../../../../shared/components/currency-input/currency-input';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { CommissionReportService } from '../../../../core/services/commission-report/commission-report.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-commission-filter',
  imports: [
    ContainerPageLayout,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    DatePicker,
    Select,
    CurrencyInput,
    ButtonComponent,
    Spinner,
  ],
  templateUrl: './commission-filter.html',
  styleUrl: './commission-filter.scss',
})
export class CommissionFilter implements OnInit {
  private fb = inject(FormBuilder);
  private sellersService = inject(SellersService);
  private notification = inject(NotificationService);
  private commissionReportService = inject(CommissionReportService);
  private router = inject(Router);
  loading = inject(LoadingService).loading;
  private destroyRef = inject(DestroyRef);
  initialDateMax = Utils.getActualDate();

  sellers = signal<ISeller[]>([]);
  sellerOptions = computed(() =>
    this.sellers().map((seller) => ({ value: seller.id, label: seller.name })),
  );
  form = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    sellerId: ['', Validators.required],
    cashCommission: [1, [Validators.required, Validators.min(0.01), Validators.max(99)]],
    installmentCommission: [0.5, [Validators.required, Validators.min(0.01), Validators.max(99)]],
    showProducts: [false],
  });

  get endDateMin(): Date | null {
    const value = this.form.controls.startDate.value;
    if (!value) return null;

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    return new Date(year, month - 1, day);
  }

  ngOnInit(): void {
    this.form.controls.startDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((startDate) => {
        const endDate = this.form.controls.endDate.value;
        if (startDate && endDate && endDate < startDate) {
          this.form.controls.endDate.setValue('');
        }
      });

    this.sellersService.findAll(1, 1000, '').subscribe({
      next: (response) => this.sellers.set(response.data ?? []),
      error: (error) =>
        this.notification.showError(`Erro ao buscar vendedores: ${error.message || error}`),
    });
  }

  onGenerateReport(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { startDate, endDate, sellerId, cashCommission, installmentCommission, showProducts } =
      this.form.getRawValue();
    const seller = this.sellers().find((item) => item.id === sellerId);
    if (!seller || !startDate || !endDate) return;

    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      this.notification.showError('Permita pop-ups para abrir o relatório em uma nova guia.');
      return;
    }
    window.focus();
    reportWindow.document.title = 'Gerando relatório de comissão';
    reportWindow.document.body.textContent = 'Gerando relatório…';

    this.commissionReportService
      .generate(
        seller.name,
        seller.id,
        startDate,
        endDate,
        cashCommission ?? 0,
        installmentCommission ?? 0,
        showProducts ?? false,
      )
      .subscribe({
        next: (blobUrl) => reportWindow.location.replace(blobUrl.toString()),
        error: (error) => {
          reportWindow.close();
          this.notification.showError(`Erro ao gerar relatório: ${error.message || error}`);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/reports']);
  }
}
