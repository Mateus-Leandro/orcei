import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const guestGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const session = await firstValueFrom(authService.getSession());

  if (session) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
