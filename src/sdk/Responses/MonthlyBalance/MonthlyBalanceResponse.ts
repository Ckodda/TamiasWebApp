export interface MonthlyBalanceResponse
{
     Id?: number;
     MonthPeriod?: Date;
     TotalIncomes?: number;
     TotalExpenses?: number;
     ClosingBalance?: number;
     CostCenterId?: number;
     CenterName?: string;
     ProfitMarginPercentage: number;
}