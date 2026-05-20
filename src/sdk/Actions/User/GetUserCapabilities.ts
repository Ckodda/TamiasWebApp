import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { AuthStorage } from "src/sdk/Actions/Auth/AuthStorage";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { UserCapabilitiesResponse } from "src/sdk/Responses/User/UserCapabilitiesResponse";

@Injectable({
  providedIn: 'root',
})
export class GetUserCapabilitiesAction {
     constructor(private http: HttpClient) {}

     Execute(): Observable<ApiResponse<UserCapabilitiesResponse>> {
          // Obtenemos los datos actualizados del storage en el momento de la ejecución
          const currentUser = AuthStorage.GetUserData();
          const token = AuthStorage.GetAccessToken();

          if (!currentUser || !currentUser.Id) {
               return throwError(() => ({ Message: "No se pudo identificar al usuario para consultar sus capacidades." }));
          }

          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });

          const url = `${TAMIAS_AUTH_ENDPOINTS.users}/${currentUser.Id}/capabilities`;
          return this.http.get<ApiResponse<UserCapabilitiesResponse>>(url, { headers });
     }
}