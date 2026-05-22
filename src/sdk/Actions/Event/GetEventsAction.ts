import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { GetEventsRequest } from "src/sdk/Requests/Event/GetEventsRequest";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { EventResponse } from "src/sdk/Responses/Event/EventResponse";
import { PaginatedResponse } from "src/sdk/Responses/PaginatedResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";

@Injectable({
     providedIn: 'root'
})
export class GetEventsAction 
{
     constructor(private http: HttpClient) 
     {}

     Execute(request: GetEventsRequest) : Observable<ApiResponse<PaginatedResponse<EventResponse>>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.events}`;
          
          const params = new HttpParams({
               fromObject: Object.entries(request).reduce((acc, [key, value]) => {
                    if (value != null && value !== '') acc[key] = value;
                    return acc;
               }, {} as any)
          });

          return this.http.get<ApiResponse<PaginatedResponse<EventResponse>>>(url, { headers, params });
     }
}