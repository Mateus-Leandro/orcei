import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreTable } from './store-table';

describe('StoreTable', () => {
  let component: StoreTable;
  let fixture: ComponentFixture<StoreTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreTable],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
