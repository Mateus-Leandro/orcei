import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { EntityFormComponent } from '../../../../shared/components/entity-form-component/entity-form-component';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { ChangePasswordDialog } from '../../components/change-password-dialog/change-password-dialog';
import { UserService } from '../../../../core/services/user/user.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { LoadingService } from '../../../../core/services/loading/loading.service';
import { PasswordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { ICreateCompanyUser, IUpdateCompanyUser } from '../../../../core/models/user/user.model';

@Component({
  selector: 'app-users-form',
  imports: [
    FormFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    EntityFormComponent,
    ButtonComponent,
    Spinner,
  ],
  templateUrl: './users-form.html',
  styleUrl: './users-form.scss',
})
export class UsersForm implements OnInit {
  formGroup: FormGroup;
  userId: string | null = null;
  isOwnProfile = false;
  loading = inject(LoadingService).loading;

  private dialog = inject(MatDialog);

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.userId = this.route.snapshot.paramMap.get('id');

    const controls: Record<string, unknown> = {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    };

    if (!this.userId) {
      controls['password'] = ['', [Validators.required, Validators.minLength(6)]];
      controls['confirmPassword'] = ['', [Validators.required, Validators.minLength(6)]];
    }

    this.formGroup = fb.group(
      controls,
      this.userId
        ? {}
        : { validators: [PasswordMatchValidator.match('password', 'confirmPassword')] },
    );
  }

  ngOnInit(): void {
    if (!this.userId) return;

    this.userService.findById(this.userId).subscribe({
      next: (user) => {
        this.formGroup.patchValue({
          name: user?.name,
          email: user?.email,
        });
      },
      error: (err) => {
        this.notificationService.showError(
          `Erro ao obter informações do usuário: ${err.message || err}`,
        );
        this.router.navigate(['/users']);
      },
    });

    this.userService.getCurrentUserId().subscribe({
      next: (currentId) => {
        this.isOwnProfile = !!currentId && currentId === this.userId;
      },
    });
  }

  openChangePasswordDialog(): void {
    this.dialog.open(ChangePasswordDialog, {
      width: '420px',
    });
  }

  onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = this.formGroup.getRawValue();

    if (this.userId) {
      const updateUser: IUpdateCompanyUser = {
        id: this.userId,
        name: payload.name,
        email: payload.email,
      };

      this.userService.update(updateUser).subscribe({
        next: () => {
          this.notificationService.showSuccess('Usuário atualizado com sucesso!');
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.notificationService.showError(
            `Erro ao atualizar usuário: ${error.message || error}`,
          );
        },
      });
      return;
    }

    const newUser: ICreateCompanyUser = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    };

    this.userService.create(newUser).subscribe({
      next: () => {
        this.notificationService.showSuccess('Usuário cadastrado com sucesso!');
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.notificationService.showError(`Erro ao cadastrar usuário: ${error.message || error}`);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  get nameControl() {
    return this.formGroup.get('name') as FormControl<string>;
  }

  get emailControl() {
    return this.formGroup.get('email') as FormControl<string>;
  }

  get passwordControl() {
    return this.formGroup.get('password') as FormControl<string>;
  }

  get confirmPasswordControl() {
    return this.formGroup.get('confirmPassword') as FormControl<string>;
  }
}
