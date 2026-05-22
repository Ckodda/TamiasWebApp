export interface GetEventsRequest
{
     Id?: number;
     EventName?: string;
     CurrencyId?: number;
     StartDate?: string;
     IsActive?: boolean|null;
     PageSize?: number;
     PageNumber?: number;
}