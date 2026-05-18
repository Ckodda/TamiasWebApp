import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthStorage } from "src/sdk/auth/AuthStorage";
import { UserResponse } from "src/sdk/responses/Auth";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { ApiResponse } from "src/sdk/responses/ApiResponse";
import { UserCapabilitiesResponse } from "src/sdk/responses/User/UserCapabilitiesResponse";

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