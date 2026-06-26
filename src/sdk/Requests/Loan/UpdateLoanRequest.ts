export interface UpdateLoanRequest
{
     Id: number;
     LenderName: string;
     PrincipalAmount: number;
     InterestAmount: number;
     TotalToRepay: number;
     RepaymentDueDate: string;
     CurrencyId: number;
     LoanStatus: 'Pending'|'Paid'|null;
}