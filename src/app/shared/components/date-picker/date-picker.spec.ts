import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { DatePicker } from './date-picker';

describe('DatePicker', () => {
  let component: DatePicker;
  let fixture: ComponentFixture<DatePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePicker);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', new FormControl<string | null>(''));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert between ISO string and Date', () => {
    component.control.setValue('2026-09-27');
    expect(component.dateControl.value).toEqual(new Date(2026, 8, 27));

    component.dateControl.setValue(new Date(2026, 0, 5));
    expect(component.control.value).toBe('2026-01-05');
  });
});
