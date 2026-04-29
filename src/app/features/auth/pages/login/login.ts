import { Component } from '@angular/core';
import { LoginForm } from '../../components/login-form/login-form';
import { AuthLayout } from '../../components/auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  imports: [LoginForm, AuthLayout],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
