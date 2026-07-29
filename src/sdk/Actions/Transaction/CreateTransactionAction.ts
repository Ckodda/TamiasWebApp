import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { CreateTransactionRequest } from "../../Requests/Transaction/CreateTransactionRequest";
import { ApiResponse } from "../../Responses/ApiResponse";
import { TransactionResponse } from "../../Responses/Transaction/TransactionResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "../../api.config";

@Injectable({
     providedIn: 'root'
})
export class CreateTransactionAction 
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreateTransactionRequest): Observable<ApiResponse<TransactionResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.transactions}`;

          return this.http.post<ApiResponse<TransactionResponse>>(url, request, { headers });
     }
}