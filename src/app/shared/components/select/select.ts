import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface ISelectOptions<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [MatInputModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class Select<T> {
  @Input({ required: true }) label: string = '';
  @Input({ required: true }) options: ISelectOptions<T>[] = [];
  @Input() selectedValue: T | null = null;

  @Output() clickOption = new EventEmitter<ISelectOptions<T>>();

  compareFn = (a: any, b: any): boolean => a?.id === b?.id;

  selectOption(value: T) {
    const option = this.options.find((item) => this.compareFn(item.value, value));
    if (option) {
      this.clickOption.emit(option);
    }
  }
}
