import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { BudgetTable } from '../../components/budget-table/budget-table';
import { IBudgetView } from '../../../../core/models/budget/budget.model';
import { BudgetService } from '../../../../core/services/budget/budget.service';
import { StoreService } from '../../../../core/services/stores/store.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CardContainer, BudgetTable, Spinner],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {
  form: FormGroup;
  budgets = signal<IBudgetView[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  private dialog = inject(MatDialog);
  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';
  private previousStoreId: string | null | undefined;

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private storeService: StoreService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      search: [''],
    });

    effect(() => {
      const storeId = this.storeService.selectedStore()?.id ?? null;
      const isStoreChange = this.previousStoreId !== undefined && this.previousStoreId !== storeId;
      this.previousStoreId = storeId;

      if (isStoreChange) {
        this.currentPage = 1;
        this.currentSearch = '';
        this.form.get('search')?.setValue('', { emitEvent: false });
      }

      this.loadBudgets({ page: this.currentPage, limit: this.currentLimit }, this.currentSearch);
    });
  }

  get searchControl(): FormControl {
    return this.form.get('search') as FormControl;
  }

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  loadBudgets(event: { page: number; limit: number }, searchText: string = ''): void {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    const storeId = this.storeService.selectedStore()?.id;

    this.budgetService.findAll(event.page, event.limit, searchText, storeId).subscribe({
      next: (response: any) => {
        this.budgets.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar Orçamentos: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadBudgets(
      {
        page: 1,
        limit: 10,
      },
      value,
    );
  }

  navigateToBudgetForm(budget?: IBudgetView) {
    return this.router.navigate([`budgets/form${budget?.id ? `/${budget.id}` : ''}`]);
  }

  onDelete(row: { id?: string; Cliente?: string }): void {
    if (!row?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Excluir orçamento',
        message: `Deseja excluir permanentemente o orçamento de "${row.Cliente ?? ''}"?`.trim(),
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.budgetService.deleteById(row.id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Orçamento excluido com sucesso!');
          this.loadBudgets(
            { page: this.currentPage, limit: this.currentLimit },
            this.currentSearch,
          );
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao excluir orçamento: ${err.message || err}`);
        },
      });
    });
  }
}
