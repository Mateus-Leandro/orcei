import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { guestGuard } from './core/guards/auth/guest-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '',
    children: AUTH_ROUTES,
    canActivate: [guestGuard],
  },
];
