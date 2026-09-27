import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SellersTable } from '../../components/sellers-table/sellers-table';
import { ISeller } from '../../../../core/models/sellers/sellers.model';
import { SellersService } from '../../../../core/services/sellers/sellers.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';

@Component({
  selector: 'app-sellers',
  imports: [CardContainer, SellersTable, Spinner],
  templateUrl: './sellers.html',
  styleUrl: './sellers.scss',
})
export class Sellers implements OnInit {
  sellers = signal<ISeller[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  private dialog = inject(MatDialog);
  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';

  constructor(
    private sellersService: SellersService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSellers({ page: this.currentPage, limit: this.currentLimit }, this.currentSearch);
  }

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  loadSellers(event: { page: number; limit: number }, searchText: string = this.currentSearch) {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    this.sellersService.findAll(event.page, event.limit, searchText).subscribe({
      next: (response) => {
        this.sellers.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar vendedores: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadSellers({ page: 1, limit: this.currentLimit }, value);
  }

  navigateToSellerForm(seller?: ISeller) {
    return this.router.navigate([`sellers/form${seller?.id ? `/${seller.id}` : ''}`]);
  }

  onDelete(row: { id?: string; Nome?: string }): void {
    if (!row?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Excluir vendedor',
        message: `Deseja excluir permanentemente o vendedor "${row.Nome ?? ''}"?`.trim(),
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.sellersService.deleteById(row.id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Vendedor excluído com sucesso!');
          this.loadSellers(
            { page: this.currentPage, limit: this.currentLimit },
            this.currentSearch,
          );
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao excluir vendedor: ${err.message || err}`);
        },
      });
    });
  }
}
