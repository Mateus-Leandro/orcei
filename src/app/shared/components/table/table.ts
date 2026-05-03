import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatPaginator],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input({ required: true }) columns: string[] = [];
  @Input({ required: true }) dataSource: any[] = [];
  @Input() totalItems: number = 0;

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  pageSize = 10;
  pageIndex = 0;

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;

    this.pageChange.emit({
      page: this.pageIndex + 1,
      limit: this.pageSize,
    });
  }
}
