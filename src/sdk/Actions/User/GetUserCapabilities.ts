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
     private CurrentUser: UserResponse | null = null;
     private Token: string | null = null;
     constructor(private http: HttpClient) {
          this.CurrentUser = AuthStorage.GetUserData();
          this.Token = AuthStorage.GetAccessToken();
     }

     Execute(): Observable<ApiResponse<UserCapabilitiesResponse>> {
          if (!this.CurrentUser || !this.CurrentUser.Id) {
               return throwError(() => ({ Message: "No se pudo identificar al usuario para consultar sus capacidades." }));
          }
          const headers = new HttpHeaders({
               Authorization: `Bearer ${this.Token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.users}/${this.CurrentUser.Id}/capabilities`;
          return this.http.get<ApiResponse<UserCapabilitiesResponse>>(url, { headers });
     }
}