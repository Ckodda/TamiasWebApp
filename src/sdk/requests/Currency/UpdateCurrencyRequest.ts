export interface UpdateCurrencyRequest
{
     Id: number;
     CurrencyName?: string;
     CurrencyCode?: string;
     CurrencySymbol?: string;
     ExchangeRate?: number;
     IsActive?: boolean;
}