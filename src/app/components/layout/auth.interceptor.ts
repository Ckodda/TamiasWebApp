import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../components/toast/toast.service';
import { AuthStorage } from 'src/sdk/Actions/Auth/AuthStorage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);
  
  // Recuperar el token usando la abstracción AuthStorage
  const token = AuthStorage.GetAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        AuthStorage.Clear(); // Limpiar sesión completa (token, datos de usuario y capacidades)
        toastService.showError('Sesión expirada. Inicie sesión nuevamente.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};