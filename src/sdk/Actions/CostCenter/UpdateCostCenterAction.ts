import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { UpdateCostCenterRequest } from "src/sdk/Requests/CostCenter/UpdateCostCenter";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root',
})
export class UpdateCostCenterAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdateCostCenterRequest): Observable<ApiResponse<CostCenterResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.costCenters}`;

          return this.http.put<ApiResponse<CostCenterResponse>>(url, request, { headers });
     }
}