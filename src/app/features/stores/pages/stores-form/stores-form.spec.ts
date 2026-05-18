import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoresForm } from './stores-form';

describe('StoresForm', () => {
  let component: StoresForm;
  let fixture: ComponentFixture<StoresForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoresForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StoresForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
