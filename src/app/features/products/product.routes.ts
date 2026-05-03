import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'products/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/products-form/products-form').then((m) => m.ProductsForm),
  },
  {
    path: 'products/form/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/products-form/products-form').then((m) => m.ProductsForm),
  },
];
