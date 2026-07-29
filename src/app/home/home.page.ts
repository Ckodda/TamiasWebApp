import { Component, OnInit, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { GetMonthlyBalancesRequest } from '../../sdk/Requests/MonthlyBalance/GetMonthlyBalancesRequest';
import { MonthlyBalanceResponse } from '../../sdk/Responses/MonthlyBalance/MonthlyBalanceResponse';
import { GetCostCentersAction } from '../../sdk/Actions/CostCenter/GetCostCentersAction';
import { GetMonthlyBalancesAction } from '../../sdk/Actions/MonthlyBalance/GetMonthlyBalancesAction';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline, pencilOutline, refreshOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { CostCenterResponse } from '../../sdk/Responses/CostCenter/CostCenterResponse';
import { SearchableSelectComponent } from '../components/searchable/searchable-select.component';

@Component({
     selector: 'app-home',
     templateUrl: 'home.page.html',
     styleUrls: ['home.page.scss'],
     standalone: true,
     imports: [
          IonContent,
          SearchableSelectComponent
     ],
})
export class HomePage implements OnInit
{
     public monthlyBalances = signal<MonthlyBalanceResponse[]>([]);
     public totalCount = signal<number>(0);
     public isLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null);

     public filters: GetMonthlyBalancesRequest = {
          StartMonth: undefined,
          EndMonth: undefined,
          CostCenterId: undefined,
          PageNumber: 1,
          PageSize: 10
     };

     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);

     constructor(
          private getMonthlyBalancesAction: GetMonthlyBalancesAction,
          private getCostCentersAction: GetCostCentersAction,
     ) 
     { 
          addIcons({ searchOutline, refreshOutline, filterOutline, addOutline, pencilOutline, trashOutline });
     }
     ngOnInit() {
          this.LoadData();
     }

     LoadData(){
          this.isLoading.set(true);
          this.validationErrors.set(null);

          this.getMonthlyBalancesAction.Execute(this.filters).subscribe({
               next: (response) => {
                    if (response.Code === 200 && response.Content) {
                         this.monthlyBalances.set(response.Content.Items);
                         this.totalCount.set(response.Content.TotalCount);
                    }
                    this.isLoading.set(false);
               },
               error: (err) => {
                    const apiError = err.error;
                    if (apiError && apiError.Code === 422 && apiError.Content) {
                         this.validationErrors.set(apiError.Content);
                    }
                    this.isLoading.set(false);
               }
          });
     }

     onCostCenterSearchChange(term: string) {
          if (term.length < 3) {
               this.costCenters.set([]);
               return;
          }
          this.isSearchingCostCenters.set(true);
          this.getCostCentersAction.Execute({ CenterName: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.costCenters.set(res.Content.Items);
               this.isSearchingCostCenters.set(false);
               },
               error: () => this.isSearchingCostCenters.set(false)
          });
     }

     onCostCenterSelected(item: CostCenterResponse) {
          this.selectedCostCenter.set(item);
          this.filters.CostCenterId = item.Id;
     }

     costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
     costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';

     ResetFilters(){
          this.filters = { CostCenterId: undefined, StartMonth: undefined, EndMonth: undefined, PageNumber: 1, PageSize: 10};
          this.LoadData();
     }

     onTablePageSizeChange(pageSize: number) {
          this.filters.PageSize = pageSize;
          this.filters.PageNumber = 1;
          this.LoadData();
     }

     onTablePageChange(pageNumber: number) {
          this.filters.PageNumber = pageNumber;
          this.LoadData();
     }
}
