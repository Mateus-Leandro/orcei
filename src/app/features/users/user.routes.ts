import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const USERS_ROUTES: Routes = [
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users/users').then((m) => m.Users),
  },
  {
    path: 'users/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users-form/users-form').then((m) => m.UsersForm),
  },
  {
    path: 'users/form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/users-form/users-form').then((m) => m.UsersForm),
  },
];
