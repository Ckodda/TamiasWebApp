import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { GetCostCentersRequest } from "src/sdk/Requests/CostCenter/GetCostCentersRequest";
import { AuthStorage } from "../Auth/AuthStorage";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";

@Injectable({
  providedIn: 'root',
})
export class GetCostCentersAction
{
     constructor(private http: HttpClient)
     {}

     Execute(request: GetCostCentersRequest): Observable<ApiResponse<PaginatedResponse<CostCenterResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.costCenters}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<CostCenterResponse>>>(url, { headers, params });
     }
}