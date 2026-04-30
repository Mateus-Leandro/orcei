import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormFieldComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.log('Formulário inválido');
      this.form.markAllAsTouched();
      return;
    }

    console.log('Formulário enviado:', this.form.value);

    // chamar API aqui
    // this.authService.login(this.form.value)
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passControl(): FormControl {
    return this.form.get('pass') as FormControl;
  }
}
