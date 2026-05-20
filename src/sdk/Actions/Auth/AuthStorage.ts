import { UserResponse } from "src/sdk/Responses/Auth";
import { UserCapabilitiesResponse } from "src/sdk/Responses/User/UserCapabilitiesResponse";


const ACCESS_TOKEN_KEY = 'tamias_access_token';
const USER_DATA_KEY = 'tamias_user_data';
const USER_CAPABILITIES_KEY = 'tamias_user_capabilities';

export class AuthStorage {
  static SetAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  static GetAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static SetUserData(user: UserResponse): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  static GetUserData(): UserResponse | null {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  static SetCapabilities(capabilities: UserCapabilitiesResponse): void {
    localStorage.setItem(USER_CAPABILITIES_KEY, JSON.stringify(capabilities));
  }

  static GetCapabilities(): UserCapabilitiesResponse | null {
    const data = localStorage.getItem(USER_CAPABILITIES_KEY);
    return data ? JSON.parse(data) : null;
  }

  static Clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(USER_CAPABILITIES_KEY);
  }
}