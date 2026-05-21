export interface GetPaymentMethodsRequest
{
     Id?: number;
     MethodName?: string;
     IsActive?: boolean | null;
     PageNumber?: number;
     PageSize?: number;
}