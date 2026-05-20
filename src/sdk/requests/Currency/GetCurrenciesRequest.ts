export class GetCurrenciesRequest
{
     Id?: number;
     CurrencyName?: string;
     CurrencyCode?: string;
     IsActive?: boolean | null; // Restringimos el tipo para evitar cadenas literales
     PageSize?: number;
     PageNumber?: number;
}