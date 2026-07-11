export interface CreateTransactionRequest
{
     UserId?: number;
     CostCenterId?: number;
     CurrencyId?: number;
     PaymentMethodId?: number;
     TransactionAmount?: number;
     TransactionType?: 'Income' | 'Expense' | null;
     AccountingPeriod?: string;
     TransactionDescription?: string;
     EventId?: number;
     PendingExpenseId?: number;
     LoanId?: number;
     AppliedExchangeRate?: boolean;
     UploadedFiles?: File[];
}