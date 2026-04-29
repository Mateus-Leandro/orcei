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
import { FormField } from '../../../../shared/components/form-field/form-field';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormField, ButtonComponent],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
})
export class RegisterForm {
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

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  get passControl(): FormControl {
    return this.form.get('pass') as FormControl;
  }

  onSubmit() {
    if (this.form.valid) {
      // Lógica para lidar com o envio do formulário, como chamar um serviço de autenticação
      console.log('Formulário enviado', this.form.value);
    } else {
      console.log('Formulário inválido');
    }
  }
}
