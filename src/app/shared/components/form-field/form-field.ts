import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-form-field',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() enablePasswordToggle = false;

  @Input({ required: true })
  control!: FormControl;

  hidePassword = true;

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  get errorMessage(): string {
    if (!this.control || !this.control.touched || !this.control.errors) {
      return '';
    }

    if (this.control.hasError('required')) {
      return `O campo ${this.label.toLowerCase()} é obrigatório`;
    }

    if (this.control.hasError('email')) {
      return 'Email inválido';
    }

    if (this.control.hasError('passwordMismatch')) {
      return 'As senhas não coincidem';
    }

    if (this.control.hasError('minlength')) {
      const requiredLength = this.control.getError('minlength')?.requiredLength;
      return `Mínimo de ${requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  get inputType(): string {
    if (this.type !== 'password') {
      return this.type;
    }

    return this.enablePasswordToggle ? (this.hidePassword ? 'password' : 'text') : 'password';
  }
}
