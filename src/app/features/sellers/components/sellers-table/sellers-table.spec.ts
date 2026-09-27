import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellersTable } from './sellers-table';

describe('SellersTable', () => {
  let component: SellersTable;
  let fixture: ComponentFixture<SellersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersTable],
    }).compileComponents();

    fixture = TestBed.createComponent(SellersTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
