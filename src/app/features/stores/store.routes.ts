import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const STORES_ROUTES: Routes = [
  {
    path: 'stores',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stores/stores').then((m) => m.Stores),
  },
  {
    path: 'stores/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stores-form/stores-form').then((m) => m.StoresForm),
  },
  {
    path: 'stores/form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/stores-form/stores-form').then((m) => m.StoresForm),
  },
];
