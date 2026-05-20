export interface ApiResponse<T = unknown> {
  Code: number;
  Message: string;
  Content: T | null;
}
