import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../components/toast/toast.service';
import { AuthStorage } from 'src/sdk/Actions/Auth/AuthStorage';
import { AuthService } from 'src/sdk/Actions/Auth/AuthService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  
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
        toastService.showError('Sesión expirada. Inicie sesión nuevamente.');
        authService.logoutAndRedirect();
      }
      return throwError(() => error);
    })
  );
};