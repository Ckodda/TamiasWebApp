import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { UpdatePaymentMethodRequest } from "src/sdk/Requests/PaymentMethod/UpdatePaymentMethodRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { PaymentMethodResponse } from "src/sdk/Responses/PaymentMethod/PaymentMethodResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";

@Injectable({
  providedIn: 'root',
})
export class UpdatePaymentMethodAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdatePaymentMethodRequest): Observable<ApiResponse<PaymentMethodResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.paymentMethods}`;

          return this.http.put<ApiResponse<PaymentMethodResponse>>(url, request, { headers });
     }
}