import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { EditableColumnType, Table, TableCellChange } from '../../../../shared/components/table/table';
import { IFinancialStatementView } from '../../../../core/models/financial-statement/financial-statement.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

export interface IFinancialStatementCellChange {
  id: string;
  field: 'costPrice' | 'margin' | 'salePrice';
  value: number;
}

@Component({
  selector: 'app-financial-statement-table',
  imports: [Table],
  templateUrl: './financial-statement-table.html',
  styleUrl: './financial-statement-table.scss',
})
export class FinancialStatementTable implements OnChanges {
  @Input({ required: true }) financialStatements: IFinancialStatementView[] = [];
  @Input() totalItems: number = 0;
  @Output() cellChange = new EventEmitter<IFinancialStatementCellChange>();
  @Output() pageChange = new EventEmitter<{ page: number; limit: number }>();

  displayedColumns = ['Loja', 'Preço de Custo', 'Margem (%)', 'Preço de Venda', 'Preço Sugerido', 'Data Alteração'];
  editableColumns = ['Preço de Custo', 'Margem (%)', 'Preço de Venda'];
  editableColumnTypes: Record<string, EditableColumnType> = {
    'Preço de Custo': 'currency',
    'Margem (%)': 'percentage',
    'Preço de Venda': 'currency',
  };
  dataSource: any[] = [];

  private readonly columnFieldMap: Record<string, 'costPrice' | 'margin' | 'salePrice'> = {
    'Preço de Custo': 'costPrice',
    'Margem (%)': 'margin',
    'Preço de Venda': 'salePrice',
  };

  constructor(
    private currencyFormatPipe: CurrencyFormatPipe,
    private dateFormatPipe: DateFormatPipe,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['financialStatements']) {
      this.mapDataSource();
    }
  }

  private mapDataSource(): void {
    this.dataSource = this.financialStatements.map((statement) => {
      const costPrice = statement.costPrice ?? 0;
      const margin = parseFloat(statement.margin as any) || 0;

      return {
        id: statement.id,
        storeId: statement.storeId,
        Loja: statement.storeName,
        'Preço de Custo': costPrice,
        'Margem (%)': margin,
        'Preço de Venda': statement.salePrice ?? 0,
        'Preço Sugerido': this.calcSuggestedPrice(costPrice, margin),
        'Data Alteração': this.dateFormatPipe.transform(statement.updatedAt),
      };
    });
  }

  onCellChange(event: TableCellChange): void {
    const { row, column, value } = event;
    const numericValue = parseFloat(value) || 0;

    const costPrice = column === 'Preço de Custo' ? numericValue : row['Preço de Custo'];
    const margin = column === 'Margem (%)' ? numericValue : row['Margem (%)'];

    row['Preço Sugerido'] = this.calcSuggestedPrice(costPrice, margin);

    const field = this.columnFieldMap[column];
    if (field) {
      this.cellChange.emit({ id: row.id, field, value: numericValue });
    }
  }

  private calcSuggestedPrice(costPrice: number, margin: number): string {
    return this.currencyFormatPipe.transform(costPrice * (1 + margin / 100));
  }
}
