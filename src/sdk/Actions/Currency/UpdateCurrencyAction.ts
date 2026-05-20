import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { AuthStorage } from "src/sdk/Actions/Auth/AuthStorage";
import { UpdateCurrencyRequest } from "src/sdk/Requests/Currency/UpdateCurrencyRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
@Injectable({
  providedIn: 'root',
})
export class UpdateCurrencyAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdateCurrencyRequest): Observable<ApiResponse<CurrencyResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.currencies}`;

          return this.http.put<ApiResponse<CurrencyResponse>>(url, request, { headers });
     }
}