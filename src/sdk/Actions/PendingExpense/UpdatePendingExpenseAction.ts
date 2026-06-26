import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { UpdatePendingExpenseRequest } from "src/sdk/Requests/PendingExpense/UpdatePendingExpenseRequest";
import { PendingExpenseResponse } from "src/sdk/Responses/PendingExpense/PendingExpenseResponse";

@Injectable({
  providedIn: 'root',
})
export class UpdatePendingExpenseAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdatePendingExpenseRequest): Observable<ApiResponse<PendingExpenseResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.pendingExpenses}`;

          return this.http.put<ApiResponse<PendingExpenseResponse>>(url, request, { headers });
     }
}