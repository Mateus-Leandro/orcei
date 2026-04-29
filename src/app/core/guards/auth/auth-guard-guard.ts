import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const session = await firstValueFrom(authService.getSession());

    if (session) {
      return true;
    }

    return router.parseUrl('/login');
  } catch (error) {
    return router.parseUrl('/login');
  }
};
