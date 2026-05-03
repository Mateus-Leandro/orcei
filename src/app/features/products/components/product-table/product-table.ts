import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { IProduct } from '../../../../core/models/product/product.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

@Component({
  selector: 'app-product-table',
  imports: [Table],
  providers: [DateFormatPipe],
  templateUrl: './product-table.html',
  styleUrl: './product-table.scss',
})
export class ProductTable implements OnChanges {
  @Input({ required: true }) products: IProduct[] = [];
  @Input() totalItems: number = 0;

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = ['Código', 'Nome', 'Data Criação', 'Data Alteração'];

  productsDataSource: any[] = [];

  constructor(private dateFormatPipe: DateFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.mapProducts();
    }
  }

  private mapProducts(): void {
    this.productsDataSource = this.products.map((product) => ({
      Código: product.code,
      Nome: product.name,
      'Data Criação': this.dateFormatPipe.transform(product.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(product.updatedAt),
    }));
  }
}
