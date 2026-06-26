import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { GetPendingExpensesRequest } from "src/sdk/Requests/PendingExpense/GetPendingExpensesRequest";
import { PendingExpenseResponse } from "src/sdk/Responses/PendingExpense/PendingExpenseResponse";

@Injectable({
     providedIn: 'root'
})
export class GetPendingExpenseAction 
{
     constructor(private http: HttpClient) 
     {}

     Execute(request: GetPendingExpensesRequest) : Observable<ApiResponse<PaginatedResponse<PendingExpenseResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.pendingExpenses}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<PendingExpenseResponse>>>(url, { headers, params });
     }
}