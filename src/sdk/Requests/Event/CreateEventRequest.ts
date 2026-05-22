export interface CreateEventRequest
{
     CostCenterId: number;
     CurrencyId: number;
     EventName: string;
     TargetAmount: number;
     EventStatus: string;
     StartDate: string;
}