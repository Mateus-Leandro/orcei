import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTable } from './customer-table';

describe('CustomerTable', () => {
  let component: CustomerTable;
  let fixture: ComponentFixture<CustomerTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
