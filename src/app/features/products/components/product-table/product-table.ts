import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { IProductView } from '../../../../core/models/product/product.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format/currency-format.pipe';

@Component({
  selector: 'app-product-table',
  imports: [Table],
  templateUrl: './product-table.html',
  styleUrl: './product-table.scss',
})
export class ProductTable implements OnChanges {
  @Input({ required: true }) products: IProductView[] = [];
  @Input() totalItems: number = 0;
  @Input() pageIndex: number = 0;

  @Output() clickRow = new EventEmitter<IProductView>();
  @Output() deleteRow = new EventEmitter<Partial<IProductView>>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = [
    'Código',
    'Nome',
    'UN',
    'Margem',
    'Preço de Custo',
    'Preço de Venda',
    'Data Criação',
    'Data Alteração',
  ];

  productsDataSource: Partial<IProductView>[] = [];

  constructor(
    private dateFormatPipe: DateFormatPipe,
    private currencyFormatPipe: CurrencyFormatPipe,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.mapProducts();
    }
  }

  private mapProducts(): void {
    this.productsDataSource = this.products.map((product) => ({
      id: product.id,
      Código: product.code,
      UN: product.saleUnit,
      Nome: product.name,
      Margem: product?.financialStatement?.margin || 0,
      'Preço de Custo': this.currencyFormatPipe.transform(
        product?.financialStatement?.costPrice || 0,
      ),
      'Preço de Venda': this.currencyFormatPipe.transform(
        product?.financialStatement?.salePrice || 0,
      ),
      'Data Criação': this.dateFormatPipe.transform(product.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(product.updatedAt),
    }));
  }
}
