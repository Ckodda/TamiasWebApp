import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { EventResponse } from "src/sdk/Responses/Event/EventResponse";
import { UpdateEventRequest } from "src/sdk/Requests/Event/UpdateEventRequest";

@Injectable({
  providedIn: 'root',
})
export class UpdateEventAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdateEventRequest): Observable<ApiResponse<EventResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.events}`;

          return this.http.put<ApiResponse<EventResponse>>(url, request, { headers });
     }
}