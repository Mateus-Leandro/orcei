import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { BUDGETS_ROUTES } from './features/budgets/budgets.routes';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: '',
    component: MainLayout,
    children: [...BUDGETS_ROUTES],
  },
];
