export interface CreateEventRequest
{
     CostCenterId?: number;
     CurrencyId?: number;
     EventName: string;
     TargetAmount: number;
     EventStatus: 'Active' | 'Completed' | 'Cancelled' | '';
     StartDate: string;
}