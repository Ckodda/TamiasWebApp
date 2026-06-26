export interface CreatePendingExpenseRequest
{
     ConstCenterId: number;
     ExpenseDescription: string;
     TotalAmount: number;
     DueDate: string;
     ProviderName: string;
     PaymentStatus: 'Pending' | 'Paid' | 'Cancelled';
}