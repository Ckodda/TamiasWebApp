import { UserResponse } from '../User/UserResponse';

export interface AuthContentResponse {
  AccessToken: string;
  TokenType: string;
  ExpiresIn: number;
  User: UserResponse;
}
