export interface CommitmentResponse
{
     Id?: number;
     UserId?: number;
     CostCenterId?: number;
     CostCenterName?: string;
     UserFullName?: string;
     CurrencyId?: number;
     CurrencyCode?: string;
     EventId?: number;
     EventName?: string;
     CommitmentAmount?: number;
     FrequencyType?:'Monthly'|'OneTime';
     CurrentStatus?:'Active'|'Fulfilled'|'Cancelled';
     CreateAt?: Date;
     UpdateAt?: Date;
     CreateBy?: number;
     UpdateBy?: number;
}