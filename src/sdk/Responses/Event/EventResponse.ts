export interface EventResponse
{
     Id: number;
     CostCenterId: number;
     EventName: string;
     TargetAmount: number;
     EventStatus: string;
     StartDate: Date;
     CurrencyId: number;
     IsActive: boolean;
     CreateAt: Date;
     UpdateAt: Date;
     CreateBy?: number;
     UpdateBy?: number;
}