import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { GetLoansRequest } from "src/sdk/Requests/Loan/GetLoansRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { LoanResponse } from "src/sdk/Responses/Loan/LoanResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";

@Injectable({
     providedIn: 'root'
})
export class GetLoansAction 
{
     constructor(private http: HttpClient) 
     {}

     Execute(request: GetLoansRequest) : Observable<ApiResponse<PaginatedResponse<LoanResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.loans}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<LoanResponse>>>(url, { headers, params });
     }
}