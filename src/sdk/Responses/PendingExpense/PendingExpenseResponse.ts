export interface PendingExpenseResponse
{
     Id?: number;
     CostCenterId?: number;
     CostCenterName?: string;
     CurrencyId?: number;
     CurrencyCode?: string;
     ExpenseDescription?: string;
     TotalAmount?: number;
     DueDate?: Date;
     ProviderName?: string;
     PaymentStatus?: 'Pending' | 'Paid' | 'Cancelled';
     IsActive: boolean;
     CreatedBy?: number;
     UpdatedBy?: number;
     CreatedAt: Date;
     UpdatedAt: Date;
}