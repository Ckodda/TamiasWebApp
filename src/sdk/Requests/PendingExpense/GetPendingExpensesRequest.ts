export interface GetPendingExpensesRequest
{
     Id?: number;
     CostCenterId?: number;
     PaymentStatus?: 'Pending' | 'Paid' | 'Cancelled' | null;
     ProviderName?: string;
     StartDate?: string;
     EndDate?: string;
     PageNumber?: number;
     PageSize?: number;
}