import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgxMaskDirective } from 'ngx-mask';
import { IconButton } from '../icon-button/icon-button';

export type EditableColumnType = 'currency' | 'percentage' | 'number';

export interface TableCellChange {
  row: any;
  column: string;
  value: any;
}

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    NgxMaskDirective,
    IconButton,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table implements OnChanges {
  @Input({ required: true }) columns: string[] = [];
  @Input({ required: true }) dataSource: any[] = [];
  @Input() totalItems: number = 0;
  @Input() deleteButton: boolean = false;
  @Input() editableColumns: string[] = [];
  @Input() editableColumnTypes: Record<string, EditableColumnType> = {};
  @Input() allowFractional: (element: any, column: string) => boolean = () => true;
  @Input() serverSidePagination: boolean = false;
  @Input() showPaginator: boolean = true;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() pageIndex = 0;

  @Output() clickRow = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() cellChange = new EventEmitter<TableCellChange>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  pageSize = 10;
  editingCell: { element: any; column: string; originalValue: number } | null = null;
  // Buffer da célula em edição como string (vírgula decimal), evita o número cru no ngx-mask.
  editValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] && !this.serverSidePagination) {
      this.clampPageIndex();
    }
  }

  get displayedData(): any[] {
    if (this.serverSidePagination) {
      return this.dataSource;
    }

    const start = this.pageIndex * this.pageSize;
    return this.dataSource.slice(start, start + this.pageSize);
  }

  get paginatorLength(): number {
    return this.serverSidePagination ? this.totalItems : this.dataSource.length;
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;

    this.pageChange.emit({
      page: this.pageIndex + 1,
      limit: this.pageSize,
    });
  }

  private clampPageIndex(): void {
    const maxPageIndex = Math.max(0, Math.ceil(this.dataSource.length / this.pageSize) - 1);

    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }
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
    const current = this.toNumber(element[column]);
    this.editingCell = { element, column, originalValue: current };
    const fractionDigits = this.decimalPlaces(element, column);
    this.editValue = current
      ? current.toLocaleString('pt-BR', {
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
          useGrouping: false,
        })
      : '';

    setTimeout(() => {
      const input = td?.querySelector('input.editable-input') as HTMLInputElement;
      input?.focus();
      input?.select();
    }, 0);
  }

  // ngx-mask já entrega a string formatada (vírgula como decimal); guardamos no buffer.
  onCellModelChange(value: string | null): void {
    this.editValue = value ?? '';
  }

  onCellEnter(event: Event): void {
    (event.target as HTMLInputElement).blur();
  }

  onCellBlur(element: any, column: string): void {
    const rawValue = this.toNumber(this.editValue);
    const originalValue = this.editingCell?.originalValue ?? rawValue;
    element[column] = rawValue;
    this.editingCell = null;
    this.editValue = '';

    if (rawValue !== originalValue) {
      this.cellChange.emit({ row: element, column, value: rawValue });
    }
  }

  // Define a máscara do ngx-mask por célula: 2 casas quando fracionado, inteiro caso contrário.
  cellMask(element: any, column: string): string {
    return `separator.${this.decimalPlaces(element, column)}`;
  }

  private decimalPlaces(element: any, column: string): number {
    return this.allowFractional(element, column) ? 2 : 0;
  }

  private toNumber(value: string | number | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }
    return parseFloat(String(value ?? '').replace(',', '.')) || 0;
  }

  formatCellValue(element: any, column: string): string {
    const numVal = this.toNumber(element[column]);
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

    const fractionDigits = this.decimalPlaces(element, column);
    return numVal.toLocaleString('pt-BR', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  }

  get displayedColumns(): string[] {
    return this.deleteButton ? [...this.columns, 'delete'] : this.columns;
  }
}
