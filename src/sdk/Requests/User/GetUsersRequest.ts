export class GetUsersRequest
{
     Id?: number;
     FullName?: string;
     Email?: string;
     IsActive?: boolean|null;
     PageSize?: number;
     PageNumber?: number;
}