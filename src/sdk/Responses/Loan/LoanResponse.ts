export interface LoanResponse 
{
     Id: number;
     LenderName: string;
     PrincipalAmount: number;
     InterestAmount: number;
     TotalToRepay: number;
     RepaymentDueDate: string;
     CurrentBalance: number;
     LoanStatus: string;
     IsActive: boolean;
     CurrencyId: number;
     CreatedBy: number;
     UpdatedBy: number;
     CreatedAt: string;
     UpdatedAt: string;
}