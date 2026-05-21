import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { GetPaymentMethodsRequest } from "src/sdk/Requests/PaymentMethod/GetPaymentMethodsRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { PaymentMethodResponse } from "src/sdk/Responses/PaymentMethod/PaymentMethodResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root',
})
export class GetPaymentMethodsAction
{
     constructor(private http: HttpClient)
     {}

     Execute(request: GetPaymentMethodsRequest): Observable<ApiResponse<PaginatedResponse<PaymentMethodResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.paymentMethods}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<PaymentMethodResponse>>>(url, { headers, params });
     }
}