import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
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
  imports: [MatInputModule, MatFormFieldModule, MatSelectModule, MatTooltipModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.select--disabled]': 'disabled',
    '[class]': "'select--' + variant",
  },
})
export class Select<T> {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) options: ISelectOptions<T>[] = [];
  @Input() selectedValue: T | null = null;
  @Input() disabled: boolean = false;
  @Input() variant: SelectVariant = 'primary';

  @Output() clickOption = new EventEmitter<ISelectOptions<T>>();

  compareFn = (a: any, b: any): boolean => a === b || a?.id === b?.id;

  get panelClass(): string {
    return `select-panel-${this.variant}`;
  }

  selectOption(value: T) {
    const option = this.options.find((item) => this.compareFn(item.value, value));
    if (option) {
      this.clickOption.emit(option);
    }
  }
}
