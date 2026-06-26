import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthStorage } from "../Auth/AuthStorage";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { CreatePendingExpenseRequest } from "src/sdk/Requests/PendingExpense/CreatePendingExpenseRequest";
import { PendingExpenseResponse } from "src/sdk/Responses/PendingExpense/PendingExpenseResponse";

@Injectable({
     providedIn: 'root'
})
export class CreatePendingExpenseAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreatePendingExpenseRequest): Observable<ApiResponse<PendingExpenseResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.pendingExpenses}`;

          return this.http.post<ApiResponse<PendingExpenseResponse>>(url, request, { headers });
     }
}