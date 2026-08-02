export interface GetMonthlyBalancesRequest 
{
     CostCenterId?: number;
     CurrencyId?: number;
     StartMonth?: string;
     EndMonth?: string;
     PageSize?: number;
     PageNumber?: number;
}