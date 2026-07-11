export interface CreateCommitmentRequest
{
     UserId: number;
     CostCenterId: number;
     CurrencyId: number;
     EventId: number;
     CommitmentAmount: number;
     FrequencyType:'Monthly'|'OneTime';
     CurrentStatus:'Active'|'Fulfilled'|'Cancelled';
}