import { environment } from '../environments/environment';

export const TAMIAS_API_BASE_URL = environment.apiBaseUrl;

export const TAMIAS_AUTH_ROUTE = `${TAMIAS_API_BASE_URL}/auth`;

export const TAMIAS_AUTH_ENDPOINTS = {
  login: `${TAMIAS_AUTH_ROUTE}/login`,
  logout: `${TAMIAS_AUTH_ROUTE}/logout`,
  users: `${TAMIAS_API_BASE_URL}/users`,
  currencies: `${TAMIAS_API_BASE_URL}/currencies`,
};
