export interface UpdateEventRequest 
{
     Id: number;
     CostCenterId?: number;
     CurrencyId?: number;
     EventName?: string;
     TargetAmount?: number;
     EventStatus?: 'Active' | 'Completed' | 'Cancelled' | null;
     StartDate?: string;
     IsActive?: boolean;
}