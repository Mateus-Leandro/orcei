import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { IconButton } from '../icon-button/icon-button';

export type EditableColumnType = 'currency' | 'percentage' | 'number';

export interface TableCellChange {
  row: any;
  column: string;
  value: any;
}

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
  @Input() editableColumns: string[] = [];
  @Input() editableColumnTypes: Record<string, EditableColumnType> = {};
  @Output() clickRow = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() cellChange = new EventEmitter<TableCellChange>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  pageSize = 10;
  pageIndex = 0;
  editingCell: { element: any; column: string; originalValue: number } | null = null;

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

  isEditable(column: string): boolean {
    return this.editableColumns.includes(column);
  }

  isCellEditing(element: any, column: string): boolean {
    return this.editingCell?.element === element && this.editingCell?.column === column;
  }

  startEditing(element: any, column: string, event: MouseEvent): void {
    event.stopPropagation();
    const td = (event.target as HTMLElement).closest('td');
    this.editingCell = { element, column, originalValue: element[column] ?? 0 };

    setTimeout(() => {
      const input = td?.querySelector('input.editable-input') as HTMLInputElement;
      if (input) {
        input.value = (element[column] ?? 0).toString().replace('.', ',');
        input.focus();
        input.select();
      }
    }, 0);
  }

  onCellInput(element: any, column: string, event: Event): void {
    element[column] = this.parseDecimal((event.target as HTMLInputElement).value);
  }

  onCellBlur(element: any, column: string, event: FocusEvent): void {
    const rawValue = this.parseDecimal((event.target as HTMLInputElement).value);
    const originalValue = this.editingCell?.originalValue ?? rawValue;
    element[column] = rawValue;
    this.editingCell = null;

    if (rawValue !== originalValue) {
      this.cellChange.emit({ row: element, column, value: rawValue });
    }
  }

  private parseDecimal(value: string): number {
    return parseFloat(value.replace(',', '.')) || 0;
  }

  formatCellValue(value: any, column: string): string {
    const numVal = parseFloat(value) || 0;
    const type = this.editableColumnTypes[column];

    if (type === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numVal);
    }

    if (type === 'percentage') {
      return `${numVal.toLocaleString('pt-BR')}%`;
    }

    return numVal.toString();
  }

  get displayedColumns(): string[] {
    return this.deleteButton ? [...this.columns, 'delete'] : this.columns;
  }
}
