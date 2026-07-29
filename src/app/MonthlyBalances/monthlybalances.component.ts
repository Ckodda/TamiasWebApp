import { Component, OnInit, signal } from "@angular/core";
import {
     IonGrid,
     IonRow,
     IonCol,
     IonInput,
     IonSelect,
     IonSelectOption,
     IonButton,
     IonIcon,
     IonBadge,
     IonText,
     IonCard,
     ModalController,
     IonCardHeader,
     IonCardTitle,
     IonCardContent,
     IonSpinner,
     IonContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import { MonthlyBalanceResponse } from "../../sdk/Responses/MonthlyBalance/MonthlyBalanceResponse";
import { ActionButton, TableColumn, TableComponent } from "../components/table/table.component";
import { GetMonthlyBalancesRequest } from "src/sdk/Requests/MonthlyBalance/GetMonthlyBalancesRequest";
import { ToastService } from "../components/toast/toast.service";
import { GetMonthlyBalancesAction } from "src/sdk/Actions/MonthlyBalance/GetMonthlyBalancesAction";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { addOutline, filterOutline, pencilOutline, refreshOutline, searchOutline, trashOutline } from "ionicons/icons";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import { SearchableSelectComponent } from "../components/searchable/searchable-select.component";

@Component({
     selector: 'app-monthly-balances',
     templateUrl: './monthlybalances.component.html',
     styleUrls: ['./monthlybalances.component.scss'],
     standalone: true,
     imports: [
          CommonModule,
          FormsModule,
          IonGrid,
          IonRow,
          IonCol,
          IonInput,
          IonSelect,
          IonSelectOption,
          IonButton,
          IonIcon,
          IonBadge,
          IonText,
          IonCard,
          IonCardHeader,
          IonCardTitle,
          IonCardContent,
          IonSpinner,
          IonContent,
          TableComponent,
          SearchableSelectComponent
     ]
})
export class MonthlyBalancesComponent implements OnInit
{
     public monthlyBalances = signal<MonthlyBalanceResponse[]>([]);
     public columns: TableColumn[] = [];
     public actionButtons: ActionButton[] = [];
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
          private toastService: ToastService
     ) {
          addIcons({ searchOutline, refreshOutline, filterOutline, addOutline, pencilOutline, trashOutline });
     }

     ngOnInit() {
          this.columns = [
               { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
               { key: 'MonthPeriod', label: 'Mes', size: '12', sizeMd: '4' },
               { key: 'TotalIncomes', label: 'Ingresos', size: '12', sizeMd: '4' },
               { key: 'TotalExpenses', label: 'Salidas', size: '12', sizeMd: '4' },
               { key: 'ClosingBalance', label: 'Saldo Cierre', size: '12', sizeMd: '4' },
               { key: 'CenterName', label: 'Centro de Costos', size: '12', sizeMd: '4' },
               { key: 'ProfitMarginPercentage', label: 'Margen beneficio', size: '12', sizeMd: '4' }
          ];

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