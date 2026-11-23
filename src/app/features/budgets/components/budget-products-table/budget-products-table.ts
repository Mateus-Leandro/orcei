import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  EditableColumnOption,
  EditableColumnType,
  Table,
  TableCellChange,
} from '../../../../shared/components/table/table';
import { IBudgetProduct } from '../../../../core/models/budget/budget.model';
import {
  isFractionalUnit,
  PRODUCT_SALE_UNIT_OPTIONS,
  ProductSaleUnit,
} from '../../../../core/models/product/product.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

export interface IBudgetProductCellChange {
  productId: string;
  changes: Partial<Pick<IBudgetProduct, 'saleUnit' | 'quantity' | 'unitPrice'>>;
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
  editableColumns = ['Unidade', 'Quantidade', 'Preço Unitário'];
  editableColumnTypes: Record<string, EditableColumnType> = {
    Unidade: 'select',
    Quantidade: 'number',
    'Preço Unitário': 'currency',
  };
  editableColumnOptions: Record<string, EditableColumnOption[]> = {
    Unidade: PRODUCT_SALE_UNIT_OPTIONS,
  };
  dataSource: any[] = [];

  // Bloqueia o separador decimal na quantidade de itens não fracionados.
  allowFractional = (element: any, column: string): boolean =>
    column === 'Quantidade' ? isFractionalUnit(element['Unidade']) : true;

  private dialog = inject(MatDialog);

  constructor(private currencyFormatPipe: CurrencyFormatPipe) {}

  confirmRemove(row: { productId: string; Produto?: string }): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Remover produto',
        message: `Deseja remover o produto "${row.Produto ?? ''}" do orçamento?`.trim(),
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.removeProduct.emit({ productId: row.productId });
    });
  }

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

    if (column === 'Unidade') {
      const saleUnit = value as ProductSaleUnit;
      const changes: IBudgetProductCellChange['changes'] = { saleUnit };

      // Ao trocar para uma unidade não fracionada, a quantidade é truncada.
      if (!isFractionalUnit(saleUnit)) {
        const quantity = Math.trunc(row['Quantidade']);
        if (quantity !== row['Quantidade']) {
          row['Quantidade'] = quantity;
          row['Preço Total'] = this.calcTotal(quantity, row['Preço Unitário']);
          changes.quantity = quantity;
        }
      }

      this.cellChange.emit({ productId: row.productId, changes });
      return;
    }

    let numericValue = parseFloat(value) || 0;

    // Itens não fracionados só aceitam quantidade inteira.
    if (column === 'Quantidade' && !isFractionalUnit(row['Unidade'])) {
      numericValue = Math.trunc(numericValue);
      row['Quantidade'] = numericValue;
    }

    const quantity = column === 'Quantidade' ? numericValue : row['Quantidade'];
    const unitPrice = column === 'Preço Unitário' ? numericValue : row['Preço Unitário'];

    row['Preço Total'] = this.calcTotal(quantity, unitPrice);

    if (column === 'Quantidade') {
      this.cellChange.emit({ productId: row.productId, changes: { quantity: numericValue } });
    } else if (column === 'Preço Unitário') {
      this.cellChange.emit({ productId: row.productId, changes: { unitPrice: numericValue } });
    }
  }

  private calcTotal(quantity: number, unitPrice: number): string {
    return this.currencyFormatPipe.transform(quantity * unitPrice);
  }
}
