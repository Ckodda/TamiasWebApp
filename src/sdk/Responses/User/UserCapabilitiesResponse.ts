export interface UserCapabilitiesResponse
{
     Roles: string[];
     Permissions: {
          [key: string]: string[];
     };
}