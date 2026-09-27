import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const SELLER_ROUTES: Routes = [
  {
    path: 'sellers',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/sellers/sellers').then((m) => m.Sellers),
  },
  {
    path: 'sellers/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/sellers-form/sellers-form').then((m) => m.SellersForm),
  },
  {
    path: 'sellers/form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/sellers-form/sellers-form').then((m) => m.SellersForm),
  },
];
