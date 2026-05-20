export interface PaginatedResponse<T>
{
     Items: T[];
     TotalCount: number;
     PageSize: number;
     PageNumber: number;
}