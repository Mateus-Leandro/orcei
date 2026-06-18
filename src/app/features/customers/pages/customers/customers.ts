import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CardContainer } from '../../../../shared/components/card-container/card-container';
import { CustomerTable } from '../../components/customer-table/customer-table';
import { ICustomer } from '../../../../core/models/customers/customers.model';
import { CustomersService } from '../../../../core/services/customers/customers.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CardContainer, CustomerTable, Spinner],
  templateUrl: './customers.html',
  styleUrl: './customers.scss',
})
export class Customers implements OnInit {
  form: FormGroup;
  customers = signal<ICustomer[]>([]);
  totalItems: number = 0;
  loading = inject(LoadingService).loading;

  private dialog = inject(MatDialog);
  private currentPage = 1;
  private currentLimit = 10;
  private currentSearch = '';

  constructor(
    private fb: FormBuilder,
    private customersService: CustomersService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadCustomers({ page: this.currentPage, limit: this.currentLimit }, this.currentSearch);
  }

  get searchControl(): FormControl {
    return this.form.get('search') as FormControl;
  }

  get pageIndex(): number {
    return this.currentPage - 1;
  }

  loadCustomers(event: { page: number; limit: number }, searchText: string = ''): void {
    this.currentPage = event.page;
    this.currentLimit = event.limit;
    this.currentSearch = searchText;

    this.customersService.findAll(event.page, event.limit, searchText).subscribe({
      next: (response: any) => {
        this.customers.set(response.data ?? []);
        this.totalItems = response.count ?? 0;
      },
      error: (err) => {
        this.notificationService.showError(`Erro ao buscar Clientes: ${err.message || err}`);
      },
    });
  }

  onSearch(value: string): void {
    this.loadCustomers(
      {
        page: 1,
        limit: 10,
      },
      value,
    );
  }

  navigateToCustomerForm(customer?: ICustomer) {
    return this.router.navigate([`customers/form${customer?.id ? `/${customer.id}` : ''}`]);
  }

  onDelete(row: { id?: string; Nome?: string }): void {
    if (!row?.id) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Excluir cliente',
        message: `Deseja excluir permanentemente o cliente "${row.Nome ?? ''}"?`.trim(),
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.customersService.deleteById(row.id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Cliente excluido com sucesso!');
          this.loadCustomers(
            { page: this.currentPage, limit: this.currentLimit },
            this.currentSearch,
          );
        },
        error: (err) => {
          this.notificationService.showError(`Erro ao excluir cliente: ${err.message || err}`);
        },
      });
    });
  }
}
