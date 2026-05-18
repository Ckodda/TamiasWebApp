import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStorage } from './AuthStorage';
import { LoginRequest } from '../requests/auth/LoginRequest';

import { TAMIAS_AUTH_ENDPOINTS } from '../api.config';
import { LoginResponse, LogoutResponse, UserResponse } from '../responses/Auth';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private CurrentUser: UserResponse | null = null;

  constructor(private http: HttpClient) {
    this.CurrentUser = AuthStorage.GetUserData();
  }

  Login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(TAMIAS_AUTH_ENDPOINTS.login, payload);
  }

  Logout(): Observable<LogoutResponse> {
    const token = this.GetAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<LogoutResponse>(TAMIAS_AUTH_ENDPOINTS.logout, null, { headers });
  }

  SaveAccessToken(accessToken: string): void {
    AuthStorage.SetAccessToken(accessToken);
  }
  
  GetAccessToken(): string | null {
    return AuthStorage.GetAccessToken();
  }

  SaveUserData(user: UserResponse): void {
    this.CurrentUser = user;
    AuthStorage.SetUserData(user);
  }
  
  GetCurrentUser(): UserResponse | null {
    return this.CurrentUser;
  }

  GetUserInitials(): string {
    if (!this.CurrentUser) return '';
    const names = this.CurrentUser.FullName.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  ClearSession(): void {
    this.CurrentUser = null;
    AuthStorage.Clear();
  }

  IsAuthenticated(): boolean {
    return !!this.GetAccessToken();
  }
}