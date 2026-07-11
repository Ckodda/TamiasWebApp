import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthStorage } from "../Auth/AuthStorage";
import { Observable, throwError } from "rxjs";
import { ApiResponse } from "src/sdk/Responses/ApiResponse";
import { TAMIAS_AUTH_ENDPOINTS } from "src/sdk/api.config";
import { CreateCommitmentRequest } from "src/sdk/Requests/Commitment/CreateCommitmentRequest";
import { CommitmentResponse } from "src/sdk/Responses/Commitment/CommitmentResponse";

@Injectable({
     providedIn: 'root'
})
export class CreateCommitmentAction
{
     constructor(private http: HttpClient)
     { }

     Execute(request: CreateCommitmentRequest): Observable<ApiResponse<CommitmentResponse>>
     {
          const token = AuthStorage.GetAccessToken();
          if (!token) {
               return throwError(() => ({ Message: "No se encontró un token de acceso válido." }));
          }

          const headers = new HttpHeaders({
               Authorization: `Bearer ${token}`,
          });
          const url = `${TAMIAS_AUTH_ENDPOINTS.commitments}`;

          return this.http.post<ApiResponse<CommitmentResponse>>(url, request, { headers });
     }
}