import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthStorage } from "../Auth/AuthStorage";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { LoanResponse } from "src/sdk/Responses/Loan/LoanResponse";
import { CreateLoanRequest } from "src/sdk/Requests/Loan/CreateLoanRequest";

@Injectable({
     providedIn: 'root'
})
export class CreateLoanAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreateLoanRequest): Observable<ApiResponse<LoanResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.loans}`;

          return this.http.post<ApiResponse<LoanResponse>>(url, request, { headers });
     }
}