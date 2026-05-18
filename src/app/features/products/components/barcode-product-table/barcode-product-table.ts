import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IconButton } from '../../../../shared/components/icon-button/icon-button';
import { Table } from '../../../../shared/components/table/table';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { IBarcodeEanAndId } from '../../../../core/models/barcode/barcode.model';

@Component({
  selector: 'app-barcode-product-table',
  imports: [IconButton, Table],
  templateUrl: './barcode-product-table.html',
  styleUrl: './barcode-product-table.scss',
})
export class BarcodeProductTable {
  @Input({ required: true }) datasource = [{}];
  @Output() addBarcode = new EventEmitter();
  @Output() removeBarcode = new EventEmitter<IBarcodeEanAndId>();
  private dialog = inject(MatDialog);

  displayColumns = ['ean'];

  deleteBarcode(barcode: IBarcodeEanAndId): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Remover código de barras',
        message: `Deseja remover o código ${barcode.ean}?`,
        confirmText: 'Remover',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      console.log(`Ean removido: ${barcode.id}`);
      return this.removeBarcode.emit(barcode);
    });
  }
}
