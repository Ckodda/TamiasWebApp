export interface CurrencyResponse
{
     Id: number;
     CurrencyName: string;
     CurrencySymbol: string;
     CurrencyCode: string;
     ExchangeRate: number;
     IsActive: boolean;
     CreatedAt: string;
     UpdatedAt: string;
     CreatedBy?: number;
     UpdatedBy?: number;
}