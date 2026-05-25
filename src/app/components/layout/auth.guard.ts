import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStorage } from 'src/sdk/Actions/Auth/AuthStorage';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = AuthStorage.GetAccessToken();

  if (token && token !== '') {
    // Aquí podrías usar una librería como jwt-decode para verificar 
    // la fecha de expiración localmente antes de hacer la petición
    return true;
  }

  router.navigate(['/login']);
  return false;
};