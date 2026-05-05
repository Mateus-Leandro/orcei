import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { CustomErrorStateMatcher } from '../../helpers/custom-error-state-matcher';

@Component({
  selector: 'app-currency-input',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './currency-input.html',
})
export class CurrencyInput implements OnInit {
  @Input({ required: true }) control!: FormControl<number | null>;
  @Input() label = 'Valor';
  @Input() placeholder = '';
  @ViewChild(MatInput) matInput!: MatInput;

  displayValue = '';
  matcher!: CustomErrorStateMatcher;

  ngOnInit() {
    this.matcher = new CustomErrorStateMatcher(this.control);
    this.displayValue = this.format(this.control.value);

    this.control.valueChanges.subscribe((value) => {
      const formatted = this.format(value);
      if (formatted !== this.displayValue) {
        this.displayValue = formatted;
      }
    });
  }

  onInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    const numeric = this.parse(input);

    this.control.setValue(numeric, { emitEvent: false });
    this.control.markAsDirty();

    this.control.updateValueAndValidity({ emitEvent: false });

    this.displayValue = this.format(numeric);
    if (this.matInput) {
      this.matInput.updateErrorState();
    }
  }

  onBlur() {
    this.control.markAsTouched();
    if (this.matInput) {
      this.matInput.updateErrorState();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    if (allowedKeys.includes(event.key)) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  get errorMessage(): string {
    if (!this.control || (!this.control.touched && !this.control.dirty) || !this.control.errors) {
      return '';
    }

    if (this.control.hasError('required')) {
      return 'Campo obrigatório';
    }

    if (this.control.hasError('min')) {
      const min = this.control.getError('min')?.min;
      return `Valor mínimo: ${this.format(min)}`;
    }

    if (this.control.hasError('max')) {
      const max = this.control.getError('max')?.max;
      return `Valor máximo: ${this.format(max)}`;
    }

    return 'Valor inválido';
  }

  private parse(value: string): number | null {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '').replace(/^0+/, '');
    if (!cleaned) return 0;
    return Number(cleaned) / 100;
  }

  private format(value: number | null): string {
    if (value === null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
