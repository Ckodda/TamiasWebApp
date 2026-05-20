import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { AuthStorage } from "src/sdk/Actions/Auth/AuthStorage";
import { GetCurrenciesRequest } from "src/sdk/Requests/Currency/GetCurrenciesRequest"; // Asegúrate de que esta importación sea correcta
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";

@Injectable({
  providedIn: 'root',
})
export class GetCurrenciesAction
{
     constructor(private http: HttpClient) {}

     Execute(request: GetCurrenciesRequest): Observable<ApiResponse<PaginatedResponse<CurrencyResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });

          // Limpiamos el objeto de request y creamos los parámetros de forma declarativa
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          const url = `${TAMIAS_AUTH_ENDPOINTS.currencies}`;
          return this.http.get<ApiResponse<PaginatedResponse<CurrencyResponse>>>(url, { headers, params });
     }
}