export interface GetTransactionsRequest
{
     Id?: number;
     StartDate?: string;
     EndDate?: string;
     CostCenterId?: number;
     TransactionType?: 'Income' | 'Expense' | null;
     UserId?: number;
     IsActive?: boolean;
     PageSize?: number;
     PageNumber?: number;
}