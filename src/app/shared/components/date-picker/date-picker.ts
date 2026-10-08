import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerIntl,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-date-picker',
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: MatDatepickerIntl,
      useFactory: () => {
        const intl = new MatDatepickerIntl();
        intl.prevMonthLabel = 'Mês anterior';
        intl.nextMonthLabel = 'Próximo mês';
        return intl;
      },
    },
  ],
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, ReactiveFormsModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker implements OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'DD/MM/AAAA';
  @Input() readonly: boolean = false;
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;

  /** Controle com a data no formato ISO (yyyy-mm-dd). */
  @Input({ required: true })
  control!: FormControl<string | null>;

  readonly dateControl = new FormControl<Date | null>(null);

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.dateControl.setValue(this.toDate(this.control.value), { emitEvent: false });
    this.syncDisabledState();

    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value !== this.toIso(this.dateControl.value)) {
        this.dateControl.setValue(this.toDate(value), { emitEvent: false });
      }
    });

    this.control.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncDisabledState());

    this.dateControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((date) => {
      this.control.setValue(this.toIso(date));
      this.control.markAsDirty();
    });
  }

  openPicker(picker: MatDatepicker<Date>): void {
    if (this.readonly || this.dateControl.disabled) return;
    picker.open();
  }

  onBlur(): void {
    this.control.markAsTouched();
  }

  get errorMessage(): string {
    if (!this.control.touched || !this.control.errors) {
      return '';
    }

    if (this.control.hasError('required')) {
      return `O campo ${this.label.toLowerCase()} é obrigatório`;
    }

    return 'Campo inválido';
  }

  private syncDisabledState(): void {
    if (this.control.disabled && this.dateControl.enabled) {
      this.dateControl.disable({ emitEvent: false });
    } else if (this.control.enabled && this.dateControl.disabled) {
      this.dateControl.enable({ emitEvent: false });
    }
  }

  private toDate(value: string | null | undefined): Date | null {
    const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    return new Date(year, month - 1, day);
  }

  private toIso(date: Date | null): string {
    if (!date || isNaN(date.getTime())) return '';

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
