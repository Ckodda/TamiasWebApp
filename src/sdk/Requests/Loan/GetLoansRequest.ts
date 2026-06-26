export interface GetLoansRequest
{
     Id?: number;
     LenderName?: string;
     CurrencyId?: number;
     RepaymentDueDate?: string;
     LoanStatus?: string;
     IsActive?: boolean;
     Page?: number;
     PageSize?: number;
     PageNumber?: number;
}