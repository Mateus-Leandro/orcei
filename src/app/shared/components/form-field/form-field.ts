import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-field',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormField {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';

  @Input({ required: true })
  control!: FormControl;

  get errorMessage(): string {
    if (!this.control || !this.control.errors || !this.control.touched) {
      return '';
    }

    if (this.control.hasError('required')) {
      return ` O campo ${this.label.toLowerCase()} é obrigatório`;
    }

    if (this.control.hasError('email')) {
      return 'Email inválido';
    }

    if (this.control.hasError('minlength')) {
      const requiredLength = this.control.getError('minlength')?.requiredLength;

      return `Mínimo de ${requiredLength} caracteres`;
    }

    if (this.control.hasError('maxlength')) {
      const requiredLength = this.control.getError('maxlength')?.requiredLength;

      return `Máximo de ${requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }
}
