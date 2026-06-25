import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth/auth-guard-guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'settings/form',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings-form/settings-form').then((m) => m.SettingsForm),
  },
];
