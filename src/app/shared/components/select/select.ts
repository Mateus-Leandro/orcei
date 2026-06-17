import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ISelectOptions<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [MatInputModule, MatFormFieldModule, MatSelectModule, MatTooltipModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  host: {
    '[class.select--disabled]': 'disabled',
  },
})
export class Select<T> {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) options: ISelectOptions<T>[] = [];
  @Input() selectedValue: T | null = null;
  @Input() disabled: boolean = false;

  @Output() clickOption = new EventEmitter<ISelectOptions<T>>();

  compareFn = (a: any, b: any): boolean => a?.id === b?.id;

  selectOption(value: T) {
    const option = this.options.find((item) => this.compareFn(item.value, value));
    if (option) {
      this.clickOption.emit(option);
    }
  }
}
