import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { AuthStorage } from "../Auth/AuthStorage";
import { CreateCostCenterRequest } from "src/sdk/Requests/CostCenter/CreateCostCenterRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { Injectable } from "@angular/core";

@Injectable({
     providedIn: 'root'
})
export class CreateCostCenterAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreateCostCenterRequest): Observable<ApiResponse<CostCenterResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.costCenters}`;

          return this.http.post<ApiResponse<CostCenterResponse>>(url, request, { headers });
     }
}