import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetsForm } from './budgets-form';

describe('BudgetsForm', () => {
  let component: BudgetsForm;
  let fixture: ComponentFixture<BudgetsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsForm],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
