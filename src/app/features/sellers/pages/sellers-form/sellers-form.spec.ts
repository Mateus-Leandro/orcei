import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellersForm } from './sellers-form';

describe('SellersForm', () => {
  let component: SellersForm;
  let fixture: ComponentFixture<SellersForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellersForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SellersForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
