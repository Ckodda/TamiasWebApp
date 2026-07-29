import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "../../../sdk/Responses/ApiResponse";
import { PaginatedResponse } from "../../../sdk/Responses/PaginatedResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "../../api.config";
import { GetMonthlyBalancesRequest } from "../../../sdk/Requests/MonthlyBalance/GetMonthlyBalancesRequest";
import { MonthlyBalanceResponse } from "../../../sdk/Responses/MonthlyBalance/MonthlyBalanceResponse";

@Injectable({
     providedIn: 'root'
})
export class GetMonthlyBalancesAction 
{
     constructor(private http: HttpClient) 
     {}

     Execute(request: GetMonthlyBalancesRequest) : Observable<ApiResponse<PaginatedResponse<MonthlyBalanceResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.monthlyBalances}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<MonthlyBalanceResponse>>>(url, { headers, params });
     }
}