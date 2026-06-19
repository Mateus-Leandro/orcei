import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  EditableColumnType,
  Table,
  TableCellChange,
} from '../../../../shared/components/table/table';
import { IBudgetProduct } from '../../../../core/models/budget/budget.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';

export interface IBudgetProductCellChange {
  productId: string;
  field: 'quantity' | 'unitPrice';
  value: number;
}

@Component({
  selector: 'app-budget-products-table',
  imports: [Table],
  templateUrl: './budget-products-table.html',
  styleUrl: './budget-products-table.scss',
})
export class BudgetProductsTable implements OnChanges {
  @Input({ required: true }) products: IBudgetProduct[] = [];

  @Output() cellChange = new EventEmitter<IBudgetProductCellChange>();
  @Output() removeProduct = new EventEmitter<{ productId: string }>();

  displayedColumns = [
    'Código',
    'Produto',
    'Unidade',
    'Quantidade',
    'Preço Unitário',
    'Preço Total',
  ];
  editableColumns = ['Quantidade', 'Preço Unitário'];
  editableColumnTypes: Record<string, EditableColumnType> = {
    Quantidade: 'number',
    'Preço Unitário': 'currency',
  };
  dataSource: any[] = [];

  private readonly columnFieldMap: Record<string, 'quantity' | 'unitPrice'> = {
    Quantidade: 'quantity',
    'Preço Unitário': 'unitPrice',
  };

  constructor(private currencyFormatPipe: CurrencyFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.mapDataSource();
    }
  }

  private mapDataSource(): void {
    this.dataSource = this.products.map((product) => ({
      productId: product.productId,
      Código: product.productCode ?? '',
      Produto: product.productName ?? '',
      Unidade: product.saleUnit ?? '',
      Quantidade: product.quantity ?? 0,
      'Preço Unitário': product.unitPrice ?? 0,
      'Preço Total': this.calcTotal(product.quantity ?? 0, product.unitPrice ?? 0),
    }));
  }

  onCellChange(event: TableCellChange): void {
    const { row, column, value } = event;
    const numericValue = parseFloat(value) || 0;

    const quantity = column === 'Quantidade' ? numericValue : row['Quantidade'];
    const unitPrice = column === 'Preço Unitário' ? numericValue : row['Preço Unitário'];

    row['Preço Total'] = this.calcTotal(quantity, unitPrice);

    const field = this.columnFieldMap[column];
    if (field) {
      this.cellChange.emit({ productId: row.productId, field, value: numericValue });
    }
  }

  private calcTotal(quantity: number, unitPrice: number): string {
    return this.currencyFormatPipe.transform(quantity * unitPrice);
  }
}
