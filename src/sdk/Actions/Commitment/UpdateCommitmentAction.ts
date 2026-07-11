import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { AuthStorage } from "../Auth/AuthStorage";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { UpdateCommitmentRequest } from "src/sdk/Requests/Commitment/UpdateCommitmentRequest";
import { CommitmentResponse } from "src/sdk/Responses/Commitment/CommitmentResponse";

@Injectable({
  providedIn: 'root',
})
export class UpdateCommitmentAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: UpdateCommitmentRequest): Observable<ApiResponse<CommitmentResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.commitments}`;

          return this.http.put<ApiResponse<CommitmentResponse>>(url, request, { headers });
     }
}