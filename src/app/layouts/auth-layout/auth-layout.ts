import { Component, inject } from '@angular/core';
import { Spinner } from '../../shared/components/spinner/spinner';
import { LoadingService } from '../../core/services/loading/loading.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  imports: [Spinner, NgClass],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  loading = inject(LoadingService).loading;

  constructor(private router: Router) {}

  registerPage(): boolean {
    return this.router.url === '/register';
  }
}
