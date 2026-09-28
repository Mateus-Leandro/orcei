import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/reports-list/reports-list').then((m) => m.ReportsList),
  },
  {
    path: 'reports/commission-by-seller',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/commission-filter/commission-filter').then((m) => m.CommissionFilter),
  },
];
