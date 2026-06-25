import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContainerPageLayout } from '../../../../layouts/container-page-layout/container-page-layout';
import { MatCardModule } from '@angular/material/card';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-settings-form',
  imports: [ContainerPageLayout, MatCardModule, ReactiveFormsModule, ButtonComponent, MatDivider],
  templateUrl: './settings-form.html',
  styleUrl: './settings-form.scss',
})
export class SettingsForm implements OnDestroy {
  private themeService = inject(ThemeService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);

  private saved = false;

  form: FormGroup;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      defaultSystemColor: [this.themeService.getPrimaryColor(), Validators.required],
    });

    this.defaultSystemColor.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((color) => this.themeService.previewPrimaryColor(color));
  }

  get defaultSystemColor(): FormControl {
    return this.form.get('defaultSystemColor') as FormControl;
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.themeService.setPrimaryColor(this.defaultSystemColor.value);
    this.saved = true;
    this.notification.showSuccess('Cor do sistema atualizada com sucesso');
  }

  ngOnDestroy(): void {
    if (!this.saved) {
      this.themeService.loadPrimaryColor();
    }
  }

  showResetColorDialog() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Restaura a cor do Sistema',
        message: `Deseja restaurar a cor padrão do sistema?`,
        confirmText: 'Sim, restaurar',
        cancelText: 'Manter atual',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.resetToDefault();
    });
  }

  resetToDefault(): void {
    this.themeService.resetPrimaryColor();
    this.defaultSystemColor.setValue(this.themeService.getPrimaryColor());
    this.notification.showSuccess('Cor do sistema restaurada para o padrão');
  }

  cancel(): void {
    this.resetToDefault();
  }
}
