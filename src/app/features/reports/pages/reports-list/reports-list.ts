import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ContainerPageLayout } from '../../../../layouts/container-page-layout/container-page-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductRegistrationReportService } from '../../../../core/services/product-registration-report/product-registration-report.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { StoreService } from '../../../../core/services/stores/store.service';

@Component({
  selector: 'app-reports-list',
  imports: [ContainerPageLayout, MatCardModule, MatIconModule, Spinner],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList {
  private router = inject(Router);
  private productReportService = inject(ProductRegistrationReportService);
  private notification = inject(NotificationService);
  private storeService = inject(StoreService);
  generatingProductReport = signal(false);

  openCommissionBySeller(): void {
    this.router.navigate(['/reports/commission-by-seller']);
  }

  openProductRegistrationReport(): void {
    if (this.generatingProductReport()) return;

    const store = this.storeService.selectedStore();
    if (!store) {
      this.notification.showError('Selecione uma loja no toolbar para gerar o relatório.');
      return;
    }

    const reportWindow = window.open('about:blank', '_blank');
    if (!reportWindow) {
      this.notification.showError('Permita pop-ups para abrir o relatório em uma nova guia.');
      return;
    }

    window.focus();
    reportWindow.document.title = 'Gerando relatório de produtos';
    reportWindow.document.body.textContent = 'Gerando relatório…';
    this.generatingProductReport.set(true);

    this.productReportService.generate(store).subscribe({
      next: (blobUrl) => {
        this.generatingProductReport.set(false);
        reportWindow.location.replace(blobUrl.toString());
      },
      error: (error) => {
        this.generatingProductReport.set(false);
        reportWindow.close();
        this.notification.showError(`Erro ao gerar relatório: ${error.message || error}`);
      },
    });
  }
}
