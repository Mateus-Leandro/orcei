import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContainerPageLayout } from '../../../layouts/container-page-layout/container-page-layout';
import { MatCardModule } from '@angular/material/card';
import { FormFieldComponent } from '../form-field/form-field';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { IconButton } from '../icon-button/icon-button';

@Component({
  selector: 'app-card-container',
  imports: [ContainerPageLayout, MatCardModule, FormFieldComponent, IconButton],
  templateUrl: './card-container.html',
  styleUrl: './card-container.scss',
})
export class CardContainer {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) placeholder: string = '';
  @Input({ required: true }) label: string = '';

  @Output() searchValue = new EventEmitter<string>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      search: [''],
    });

    this.searchControl.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      this.searchValue.emit(value);
    });
  }

  get searchControl(): FormControl {
    return this.form.get('search') as FormControl;
  }
}
