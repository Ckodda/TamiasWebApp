export interface GetMonthlyBalancesRequest 
{
     CostCenterId?: number;
     StartMonth?: string;
     EndMonth?: string;
     PageSize?: number;
     PageNumber?: number;
}