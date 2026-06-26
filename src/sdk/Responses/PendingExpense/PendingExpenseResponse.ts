export interface PendingExpenseResponse
{
     Id?: number;
     CostCenterId?: number;
     ExpenseDescription?: string;
     TotalAmount?: number;
     DueDate?: string;
     ProviderName?: string;
     PaymentStatus?: 'Pending' | 'Paid' | 'Cancelled';
     IsActive: boolean;
     CreatedBy?: number;
     UpdatedBy?: number;
     CreatedAt: string;
     UpdatedAt: string;
}