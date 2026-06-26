import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { LoanResponse } from "src/sdk/Responses/Loan/LoanResponse";
import { UpdateLoanRequest } from "src/sdk/Requests/Loan/UpdateLoanRequest";

@Injectable({
  providedIn: 'root',
})
export class UpdateLoanAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdateLoanRequest): Observable<ApiResponse<LoanResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.loans}`;

          return this.http.put<ApiResponse<LoanResponse>>(url, request, { headers });
     }
}