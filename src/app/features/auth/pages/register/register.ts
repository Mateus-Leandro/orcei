import { Component } from '@angular/core';
import { RegisterForm } from '../../components/register-form/register-form';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-register',
  imports: [RegisterForm, AuthLayout],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {}
