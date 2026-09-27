import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { ISeller } from '../../../../core/models/sellers/sellers.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

@Component({
  selector: 'app-sellers-table',
  imports: [Table],
  templateUrl: './sellers-table.html',
  styleUrl: './sellers-table.scss',
})
export class SellersTable implements OnChanges {
  @Input({ required: true }) sellers: ISeller[] = [];
  @Input() totalItems: number = 0;
  @Input() pageIndex: number = 0;

  @Output() clickRow = new EventEmitter<ISeller>();
  @Output() deleteRow = new EventEmitter<Partial<ISeller>>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = ['Código', 'Nome', 'Data Criação', 'Data Alteração'];

  sellersDataSource: Partial<ISeller>[] = [];
  rowClass = (row: Partial<ISeller>) => ({ blocked: row.active === false });

  constructor(private dateFormatPipe: DateFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sellers']) {
      this.mapSellers();
    }
  }

  private mapSellers(): void {
    this.sellersDataSource = this.sellers.map((seller) => ({
      id: seller.id,
      active: seller.active,
      Código: seller.code,
      Nome: seller.name,
      'Data Criação': this.dateFormatPipe.transform(seller.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(seller.updatedAt),
    }));
  }
}
