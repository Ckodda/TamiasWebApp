export interface UpdateUserRequest
{
     Id: number;
     FullName?: string;
     Email?: string;
     Password?: string;
     IsActive?: boolean;
}