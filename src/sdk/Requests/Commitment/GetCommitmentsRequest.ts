export interface GetCommitmentsRequest
{
     Id?: number;
     UserId?: number;
     CostCenterId?: number;
     CurrencyId?: number;
     EventId?: number;
     CurrentStatus?: 'Active' | 'Fulfilled' | 'Cancelled' | null;
     PageSize?: number;
     PageNumber?: number;
}