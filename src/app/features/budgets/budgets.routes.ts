import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const BUDGETS_ROUTES: Routes = [
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/budgets/budgets').then((m) => m.Budgets),
  },
  {
    path: 'budgets/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/budgets-form/budgets-form').then((m) => m.BudgetsForm),
  },
  {
    path: 'budgets/form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/budgets-form/budgets-form').then((m) => m.BudgetsForm),
  },
];
