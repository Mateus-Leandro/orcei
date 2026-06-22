import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { UserService } from '../../../../core/services/user/user.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { PasswordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-change-password-dialog',
  imports: [MatDialogModule, ReactiveFormsModule, FormFieldComponent, ButtonComponent, Spinner],
  templateUrl: './change-password-dialog.html',
  styleUrl: './change-password-dialog.scss',
})
export class ChangePasswordDialog {
  formGroup: FormGroup;
  loading = inject(LoadingService).loading;

  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialog>,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.formGroup = fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: [PasswordMatchValidator.match('newPassword', 'confirmNewPassword')] },
    );
  }

  onConfirm(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.formGroup.getRawValue();

    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.notificationService.showSuccess('Senha alterada com sucesso!');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao alterar senha: ${error.message || error}`);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get currentPasswordControl() {
    return this.formGroup.get('currentPassword') as FormControl<string>;
  }

  get newPasswordControl() {
    return this.formGroup.get('newPassword') as FormControl<string>;
  }

  get confirmNewPasswordControl() {
    return this.formGroup.get('confirmNewPassword') as FormControl<string>;
  }
}
