export interface EventResponse
{
     Id: number;
     CostCenterId: number;
     CenterName: string;
     EventName: string;
     TargetAmount: number;
     EventStatus: string;
     StartDate: Date;
     CurrencyId: number;
     CurrencyCode: string;
     CurrencySymbol: string;
     CurrencyName: string;
     IsActive: boolean;
     CreateAt: Date;
     UpdateAt: Date;
     CreateBy?: number;
     UpdateBy?: number;
}