import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { IconButton } from '../icon-button/icon-button';

@Component({
  selector: 'app-table',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, IconButton],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  @Input({ required: true }) columns: string[] = [];
  @Input({ required: true }) dataSource: any[] = [];
  @Input() totalItems: number = 0;
  @Input() deleteButton: boolean = false;
  @Output() clickRow = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

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

  onRowClick(row: any): void {
    this.clickRow.emit(row);
  }

  onDelete(row: any): void {
    this.delete.emit(row);
  }

  get displayedColumns(): string[] {
    return this.deleteButton ? [...this.columns, 'delete'] : this.columns;
  }
}
