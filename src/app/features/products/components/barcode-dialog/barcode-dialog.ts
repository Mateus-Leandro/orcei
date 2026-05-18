import { Component, signal } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-barcode-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    ButtonComponent,
  ],
  templateUrl: './barcode-dialog.html',
  styleUrl: './barcode-dialog.scss',
})
export class BarcodeDialog {
  formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<BarcodeDialog>,
    fb: FormBuilder,
  ) {
    this.formGroup = fb.group({
      barcode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.minLength(8),
          Validators.maxLength(14),
        ],
      ],
    });
  }

  confirm() {
    if (this.formGroup.invalid) {
      return this.formGroup.markAllAsTouched();
    }

    this.dialogRef.close(this.barcodeControl.value);
  }

  cancel() {
    this.dialogRef.close();
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  get barcodeControl() {
    return this.formGroup.get('barcode') as FormControl<string>;
  }
}
