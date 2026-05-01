import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { Router } from '@angular/router';
import { PasswordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { Location } from '@angular/common';
import { ICreateUser } from '../../../../core/models/user/user.model';
import { ICreateUsercompany } from '../../../../core/models/company/company.model';
import { CompanyService } from '../../../../core/services/company/company.service';

@Component({
  selector: 'app-register-form',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
})
export class RegisterForm {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private location: Location,
    private companyService: CompanyService,
  ) {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        pass: ['', [Validators.required, Validators.minLength(6)]],
        confirmPass: ['', [Validators.required, Validators.minLength(6)]],
        name: ['', [Validators.required, Validators.minLength(3)]],
        cnpj: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      },
      { validators: [PasswordMatchValidator.match('pass', 'confirmPass')] },
    );
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passControl(): FormControl {
    return this.form.get('pass') as FormControl;
  }

  get confirmPassControl(): FormControl {
    return this.form.get('confirmPass') as FormControl;
  }

  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get cnpjControl(): FormControl {
    return this.form.get('cnpj') as FormControl;
  }

  onSubmit() {
    if (this.form.valid) {
      this.companyService.searchForCnpj(this.cnpjControl.value).subscribe({
        next: (response) => {
          const createCompany: ICreateUsercompany = {
            cnpj: response.cnpj,
            name: response.razao_social,
          };
          const createUser: ICreateUser = {
            name: this.nameControl.value,
            email: this.emailControl.value,
            pass: this.passControl.value,
            company: createCompany,
          };
          this.authService.createAccount(createUser).subscribe({
            next: () => {
              this.notificationService.showSuccess(
                'Conta criada com sucesso! Realize o login para utilizar o sistema.',
              );
              this.router.navigate(['/login']);
            },
            error: (err) => {
              this.notificationService.showError(
                err.message || 'Erro ao criar conta. Tente novamente.',
              );
            },
          });
        },
        error: (err) => {
          this.notificationService.showError(
            `Erro ao consultar CNPJ ${this.cnpjControl.value}: ${err.message || err} `,
          );
        },
      });
    }
  }

  return() {
    this.location.back();
  }
}
