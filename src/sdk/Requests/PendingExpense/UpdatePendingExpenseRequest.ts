export interface UpdatePendingExpenseRequest
{
     Id: number;
     CostCenterId?: number;
     ExpenseDescription?: string;
     TotalAmount?: number;
     DueDate?: string;
     ProviderName?: string;
     PaymentStatus?: 'Pending' | 'Paid' | 'Cancelled'|null;
     IsActive?: boolean;
}