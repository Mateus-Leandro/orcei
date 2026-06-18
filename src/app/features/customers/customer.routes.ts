import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: 'customers',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/customers/customers').then((m) => m.Customers),
  },
  {
    path: 'customers/form',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/customers-form/customers-form').then((m) => m.CustomersForm),
  },
  {
    path: 'customers/form/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/customers-form/customers-form').then((m) => m.CustomersForm),
  },
];
