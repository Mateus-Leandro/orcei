import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { ICustomer } from '../../../../core/models/customers/customers.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

@Component({
  selector: 'app-customer-table',
  imports: [Table],
  templateUrl: './customer-table.html',
  styleUrl: './customer-table.scss',
})
export class CustomerTable implements OnChanges {
  @Input({ required: true }) customers: ICustomer[] = [];
  @Input() totalItems: number = 0;
  @Input() pageIndex: number = 0;

  @Output() clickRow = new EventEmitter<ICustomer>();
  @Output() deleteRow = new EventEmitter<Partial<ICustomer>>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = [
    'Código',
    'Nome',
    'Sobrenome',
    'Documento',
    'Telefone',
    'Data Criação',
    'Data Alteração',
  ];

  customersDataSource: Partial<ICustomer>[] = [];

  constructor(private dateFormatPipe: DateFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customers']) {
      this.mapCustomers();
    }
  }

  private mapCustomers(): void {
    this.customersDataSource = this.customers.map((customer) => ({
      id: customer.id,
      Código: customer.code,
      Nome: customer.name,
      Sobrenome: customer.surname ?? '',
      Documento: customer.document ?? '',
      Telefone: customer.phone ?? '',
      'Data Criação': this.dateFormatPipe.transform(customer.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(customer.updatedAt),
    }));
  }
}
