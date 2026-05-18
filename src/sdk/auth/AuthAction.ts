import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, switchMap, map, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './AuthService';
import { LoginRequest } from '../requests/auth/LoginRequest';
import { GetAvatarColor } from '../../shared/ColorGenerator';
import { LoginResponse, LogoutResponse } from '../responses/Auth';
import { GetUserCapabilitiesAction } from '../Actions/User/GetUserCapabilities';
import { GetUserAccessControlAction } from '../Actions/User/GetUserAccessControlAction';

export interface ValidationError {
  Field: string;
  Message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthAction {
  constructor(
    private authService: AuthService,
    private router: Router,
    private getCapabilitiesAction: GetUserCapabilitiesAction,
    private accessControl: GetUserAccessControlAction
  ) {}

  ValidateLoginRequest(email: string, password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!email || email.trim() === '') {
      errors.push({ Field: 'Email', Message: 'El correo electrónico es requerido' });
    } else if (!this.IsValidEmail(email)) {
      errors.push({ Field: 'Email', Message: 'Ingrese un correo electrónico válido' });
    }

    if (!password || password.trim() === '') {
      errors.push({ Field: 'Password', Message: 'La contraseña es requerida' });
    } else if (password.length < 6) {
      errors.push({ Field: 'Password', Message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    return errors;
  }

  PerformLogin(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = {
      Email: email,
      Password: password,
    };

    return this.authService.Login(payload).pipe(
      tap((response) => {
        if (response.Code === 200 && response.Content?.User) {
          const User = response.Content.User;
          
          // Asignamos un color aleatorio único para esta sesión de inicio
          User.AvatarColor = GetAvatarColor(Date.now().toString() + Math.random().toString());
          
          this.authService.SaveAccessToken(response.Content.AccessToken);
          this.authService.SaveUserData(User);
        }
      }),
      // Encadenamos la carga de capacidades inmediatamente después del login exitoso
      switchMap((response) => {
        if (response.Code === 200) {
          return this.getCapabilitiesAction.Execute().pipe(
            tap((capRes) => {
              if (capRes.Content) {
                this.accessControl.UpdateCapabilities(capRes.Content);
              }
            }),
            map(() => response) // Retornamos la respuesta original del login
          );
        }
        return of(response);
      }),
      catchError((error) => {
        return throwError(() => ({
          Message: error.error?.Message || 'Error al iniciar sesión. Intente nuevamente.',
        }));
      })
    );
  }

  PerformLogout(): Observable<LogoutResponse> {
    return this.authService.Logout().pipe(
      tap(() => {
        this.accessControl.Clear();
        this.authService.ClearSession();
      }),
      catchError((error) => {
        this.authService.ClearSession();
        return throwError(() => ({
          Message: error.error?.Message || 'Error al cerrar sesión.',
        }));
      })
    );
  }

  private IsValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Recupera el token de autenticación para su uso en las posteriores solicitudes.
   * Si no se encuentra, deduce que el usuario no está autenticado,
   * limpia la sesión y redirige al login.
   */
  GetAccessToken(): string | null {
    const token = this.authService.GetAccessToken();
    if (!token) {
      this.HandleUnauthenticated();
      return null;
    }
    return token;
  }

  /**
   * Verifica si el usuario está autenticado. 
   * Si no hay sesión válida, limpia el storage y redirige al login.
   */
  IsAuthenticated(): boolean {
    const isAuth = this.authService.IsAuthenticated();
    if (!isAuth) {
      this.HandleUnauthenticated();
    }
    return isAuth;
  }

  /**
   * Obtiene los datos del usuario actual desde el almacenamiento persistente.
   * @returns El objeto de usuario o null si no hay sesión.
   */
  GetUserData(): any {
    return this.authService.GetCurrentUser() || (this.HandleUnauthenticated(), null);
  }

  /**
   * Obtiene las iniciales del usuario logeado.
   * @returns Iniciales (ej: "JD") o vacío si no hay sesión.
   */
  GetUserInitials(): string {
    if (!this.authService.IsAuthenticated()) {
      this.HandleUnauthenticated();
    }
    return this.authService.GetUserInitials();
  }

  /**
   * Comprueba de forma reactiva o directa si el usuario tiene un permiso.
   * Útil para componentes que inyectan AuthAction.
   */
  Can(module: string, action: string): boolean {
    return this.accessControl.HasPermission(module, action);
  }

  private HandleUnauthenticated(): void {
    this.accessControl.Clear();
    this.authService.ClearSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
