import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialStatementTable } from './financial-statement-table';

describe('FinancialStatementTable', () => {
  let component: FinancialStatementTable;
  let fixture: ComponentFixture<FinancialStatementTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialStatementTable],
    }).compileComponents();

    fixture = TestBed.createComponent(FinancialStatementTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
