import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEnvironmentNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { MatPaginatorIntlPtBr } from './shared/helpers/mat-paginator-intl-pt-br';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { ThemeService } from './core/services/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEnvironmentNgxMask(),
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlPtBr },
    provideAppInitializer(() => inject(ThemeService).loadPrimaryColor()),
  ],
};
