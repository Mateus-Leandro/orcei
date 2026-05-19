import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';
import { IStoreView } from '../../../../core/models/store/store.model';

@Component({
  selector: 'app-store-table',
  imports: [Table],
  templateUrl: './store-table.html',
  styleUrl: './store-table.scss',
})
export class StoreTable implements OnChanges {
  @Input({ required: true }) stores: IStoreView[] = [];
  @Input() totalItems: number = 0;

  @Output() clickRow = new EventEmitter<IStoreView>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = ['Número', 'Nome', 'Data Criação', 'Data Alteração'];

  storesDataSource: Partial<IStoreView>[] = [];

  constructor(private dateFormatPipe: DateFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stores']) {
      this.mapStores();
    }
  }

  private mapStores(): void {
    this.storesDataSource = this.stores.map((store) => ({
      id: store.id,
      Número: store.storeNumber,
      Nome: store.name,
      'Data Criação': this.dateFormatPipe.transform(store.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(store.updatedAt),
    }));
  }
}
