export interface TransactionResponse 
{
     Id?: number;
     UserId?: number;
     CostCenterId?: number;
     EventId?: number;
     PendingExpenseId?: number;
     LoanId?: number;
     CurrencyId?: number;
     PaymentMethodId?: number;
     TransactionAmount?: number;
     TransactionType?: string;
     AppliedExchangeRate?: boolean;
     AccountingPeriod?: string;
     TransactionDescription?: string;
     ReceiptImagePath?: string;
     IsActive?: boolean;
     CreatedBy?: number;
     UpdateBy?: number;
     UpdatedAt?: Date;
     CreatedAt?: Date;

     UserFullName?: string;
     CostCenterName?: string;
     CurrencySymbol?: string;
     PaymentMethodName?: string;

}