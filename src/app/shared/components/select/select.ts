import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ISelectOptions<T> {
  value: T;
  label: string;
}

export type SelectVariant = 'primary' | 'secondary';

@Component({
  selector: 'app-select',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.select--disabled]': 'disabled || control?.disabled',
    '[class.select--primary]': "variant === 'primary'",
    '[class.select--secondary]': "variant === 'secondary'",
  },
})
export class Select<T> implements OnChanges {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) options: ISelectOptions<T>[] = [];
  @Input() selectedValue: T | null = null;
  @Input() disabled: boolean = false;
  @Input() variant: SelectVariant = 'primary';

  /** Quando informado, o valor e as validações passam a vir do controle. */
  @Input() control: FormControl<T | null> | null = null;

  @Output() clickOption = new EventEmitter<ISelectOptions<T>>();

  private disabledByInput = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] || changes['control']) {
      this.syncDisabledState();
    }
  }

  private syncDisabledState(): void {
    if (!this.control) return;

    if (this.disabled && !this.control.disabled) {
      this.control.disable({ emitEvent: false });
      this.disabledByInput = true;
    } else if (!this.disabled && this.disabledByInput) {
      this.control.enable({ emitEvent: false });
      this.disabledByInput = false;
    }
  }

  compareFn = (a: any, b: any): boolean =>
    a === b || (a?.id != null && a.id === b?.id);

  get panelClass(): string {
    return `select-panel-${this.variant}`;
  }

  get errorMessage(): string {
    if (!this.control || !this.control.touched || !this.control.errors) {
      return '';
    }

    if (this.control.hasError('required')) {
      return `O campo ${this.label.toLowerCase()} é obrigatório`;
    }

    return 'Campo inválido';
  }

  selectOption(value: T) {
    const option = this.options.find((item) => this.compareFn(item.value, value));
    if (option) {
      this.clickOption.emit(option);
    }
  }
}
