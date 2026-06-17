import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-form-field',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
})
export class FormFieldComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() enablePasswordToggle = false;
  @Input() mask: string = '';
  @Input() prefixIcon: string = '';
  @Input() suffixIcon: string = '';
  @Input() readonly: boolean = false;
  @Input() disabled: boolean = false;

  @Input({ required: true })
  control!: FormControl;

  hidePassword = true;

  private disabledByInput = false;

  ngOnInit(): void {
    this.syncDisabledState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] || changes['control']) {
      this.syncDisabledState();
    }
  }

  private syncDisabledState(): void {
    if (!this.control) return;

    if (this.disabled && !this.control.disabled) {
      this.control.disable({ emitEvent: false });
      this.disabledByInput = true;
    } else if (!this.disabled && this.disabledByInput) {
      this.control.enable({ emitEvent: false });
      this.disabledByInput = false;
    }
  }

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
