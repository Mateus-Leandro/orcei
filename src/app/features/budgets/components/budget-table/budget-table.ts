import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { IBudgetView } from '../../../../core/models/budget/budget.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';

@Component({
  selector: 'app-budget-table',
  imports: [Table],
  templateUrl: './budget-table.html',
  styleUrl: './budget-table.scss',
})
export class BudgetTable implements OnChanges {
  @Input({ required: true }) budgets: IBudgetView[] = [];
  @Input() totalItems: number = 0;
  @Input() pageIndex: number = 0;

  @Output() clickRow = new EventEmitter<IBudgetView>();
  @Output() deleteRow = new EventEmitter<Partial<IBudgetView>>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = [
    'Número',
    'Cliente',
    'Qtde de Produtos',
    'Valor Total',
    'Previsão de Entrega',
    'Data Criação',
    'Data Alteração',
  ];

  budgetsDataSource: any[] = [];

  constructor(
    private dateFormatPipe: DateFormatPipe,
    private currencyFormatPipe: CurrencyFormatPipe,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['budgets']) {
      this.mapBudgets();
    }
  }

  private mapBudgets(): void {
    this.budgetsDataSource = this.budgets.map((budget) => ({
      id: budget.id,
      Número: budget.budgetNumber,
      Cliente: budget.customerName,
      'Qtde de Produtos': budget.totalProducts,
      'Valor Total': this.currencyFormatPipe.transform(budget.totalValue),
      'Previsão de Entrega': this.formatDate(budget.deliveryForecast),
      'Data Criação': this.dateFormatPipe.transform(budget.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(budget.updatedAt),
    }));
  }

  // delivery_forecast é DATE (YYYY-MM-DD); formata sem Date() para evitar
  // deslocamento de fuso horário.
  private formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}
