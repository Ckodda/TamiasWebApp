import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/sdk/Actions/Auth/AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.IsAuthenticated()) {
    return true;
  }

  authService.logoutAndRedirect();
  return false;
};