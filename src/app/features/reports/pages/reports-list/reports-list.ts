import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ContainerPageLayout } from '../../../../layouts/container-page-layout/container-page-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports-list',
  imports: [ContainerPageLayout, MatCardModule, MatIconModule],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss',
})
export class ReportsList {
  private router = inject(Router);

  openCommissionBySeller(): void {
    this.router.navigate(['/reports/commission-by-seller']);
  }
}
