import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { GetUsersRequest } from "src/sdk/Requests/User/GetUsersRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { UserResponse } from "src/sdk/Responses/Auth";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root',
})
export class GetUsersAction
{
     constructor(private http: HttpClient)
     {}

     Execute(request: GetUsersRequest): Observable<ApiResponse<PaginatedResponse<UserResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.users}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<UserResponse>>>(url, { headers, params });
     }
}