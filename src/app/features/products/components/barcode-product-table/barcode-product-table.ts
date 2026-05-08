import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButton } from '../../../../shared/components/icon-button/icon-button';
import { Table } from '../../../../shared/components/table/table';

@Component({
  selector: 'app-barcode-product-table',
  imports: [IconButton, Table],
  templateUrl: './barcode-product-table.html',
  styleUrl: './barcode-product-table.scss',
})
export class BarcodeProductTable {
  @Input({ required: true }) datasource = [{}];
  @Output() addBarcode = new EventEmitter();

  displayColumns = ['ean'];

  deleteBarcode(ean: any) {
    console.log(`Deletado: ${ean.id}`);
  }
}
