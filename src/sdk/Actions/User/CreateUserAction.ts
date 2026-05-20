import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { AuthStorage } from "src/sdk/Actions/Auth/AuthStorage";
import { CreateUserRequest } from "src/sdk/Requests/User/CreateUserRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { UserResponse } from "src/sdk/Responses/Auth";
@Injectable({
  providedIn: 'root',
})
export class CreateUserAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreateUserRequest): Observable<ApiResponse<UserResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.users}`;

          return this.http.post<ApiResponse<UserResponse>>(url, request, { headers });
     }
}