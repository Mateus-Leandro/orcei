import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { ICustomer } from '../../../../core/models/customers/customers.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj/cpf-cnpj.pipe';

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
    'Apelido',
    'Documento',
    'Telefone',
    'Data Criação',
    'Data Alteração',
  ];

  customersDataSource: Partial<ICustomer>[] = [];
  rowClass = (row: Partial<ICustomer>) => ({ blocked: !!row.blocked });

  constructor(
    private dateFormatPipe: DateFormatPipe,
    private cpfCnpjPipe: CpfCnpjPipe,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customers']) {
      this.mapCustomers();
    }
  }

  private mapCustomers(): void {
    this.customersDataSource = this.customers.map((customer) => ({
      id: customer.id,
      blocked: customer.blocked,
      Código: customer.code,
      Nome: customer.name,
      Apelido: customer.surname ?? '',
      Documento: this.cpfCnpjPipe.transform(customer.document),
      Telefone: customer.phone ?? '',
      'Data Criação': this.dateFormatPipe.transform(customer.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(customer.updatedAt),
    }));
  }
}
