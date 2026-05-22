export interface UpdateEventRequest 
{
     Id: number;
     CostCenterId?: number;
     CurrencyId?: number;
     EventName?: string;
     TargetAmount?: number;
     EventStatus?: string;
     StartDate?: string;
     IsActive?: boolean;
}