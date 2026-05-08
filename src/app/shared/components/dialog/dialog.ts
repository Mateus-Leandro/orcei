import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '../button/button';

export interface DialogData {
  title: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-dialog',
  imports: [MatDialogModule, ButtonComponent],
  templateUrl: './dialog.html',
})
export class DialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData,
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
