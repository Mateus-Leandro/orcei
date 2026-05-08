import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeProductTable } from './barcode-product-table';

describe('BarcodeProductTable', () => {
  let component: BarcodeProductTable;
  let fixture: ComponentFixture<BarcodeProductTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeProductTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeProductTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
