import { ApiResponse } from 'src/sdk/Responses/ApiResponse';
import { AuthContentResponse } from './AuthContentResponse';

export type LoginResponse = ApiResponse<AuthContentResponse>;
