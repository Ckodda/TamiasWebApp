import { Component, OnInit, signal } from "@angular/core";
import { GetTransactionsRequest } from "src/sdk/Requests/Transaction/GetTransactionsRequest";
import { TransactionResponse } from "src/sdk/Responses/Transaction/TransactionResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { ActionButton, TableColumn, TableComponent } from "../components/table/table.component";
import { ToastService } from "../components/toast/toast.service";
import { GetTransactionsAction } from "src/sdk/Actions/Transaction/GetTransactionsAction";
import { Router } from "@angular/router"; // Removed RouterLink
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonSpinner,
  IonButtons,
  IonIcon,
  IonText,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from "ionicons";
import { addOutline, refreshOutline, searchOutline } from "ionicons/icons";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SearchableSelectComponent } from "../components/searchable/searchable-select.component";

@Component({
     selector: "app-transactions",
     templateUrl: "./transactions.component.html",
     styleUrls: ["./transactions.component.scss"],
     standalone: true,
     imports: [
          CommonModule,
          FormsModule,
          IonHeader,
          IonToolbar,
          IonTitle,
          IonContent,
          IonButton,
          IonSpinner,
          IonCard,
          IonCardContent,
          IonButtons,
          IonIcon,
          TableComponent,
          IonText,
          IonCardHeader,
          IonCardTitle,
          IonGrid,
          IonRow,
          IonCol,
          IonInput,
          IonSelect,
          IonSelectOption,
          SearchableSelectComponent,
     ],
})
export class TransactionsComponent implements OnInit
{
     public transactions = signal<TransactionResponse[]>([]);
     public isLoading = signal<boolean>(true);
     public validationErrors = signal<any>(null);
     public totalCount = signal<number>(0);

     public filters: GetTransactionsRequest = {
         Id: undefined,
         CostCenterId: undefined,
         TransactionType: null,
         UserId: undefined,
         IsActive: undefined,
         PageNumber: 1,
         PageSize: 10,
         StartDate: undefined,
         EndDate: undefined
       };

     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);

     public transactionsColumns: TableColumn[] = [];

     public actionButtons: ActionButton[] = [];
     constructor(
          private getTransactionsAction: GetTransactionsAction,
          private toastService: ToastService,
          private router: Router,
          private getCostCentersAction: GetCostCentersAction
     ) {
          addIcons({ addOutline, searchOutline, refreshOutline });
     }

     ngOnInit(): void {
          this.transactionsColumns = [
               { key: 'Id', label:'ID', size: '6', sizeMd: '1' },
               { key: 'UserFullName', label:'Usuario', size: '6', sizeMd: '1' },
               { key: 'CostCenterName', label:'Centro de Costo', size: '6', sizeMd: '2' },
               { 
                 key: 'TransactionType', 
                 label:'Tipo', 
                 size: '6', 
                 sizeMd: '1', 
                 type: 'badge',
                 valueFormatter: (item: TransactionResponse) => item.TransactionType === 'Income' ? 'Ingreso' : 'Salida',
                 classFormatter: (item: TransactionResponse) => item.TransactionType === 'Income' ? 'success' : 'warning'
               },
               { key: 'TransactionAmount', label:'Monto', size: '6', sizeMd: '1' },
               { key: 'AccountingPeriod', label:'Fecha', size: '6', sizeMd: '2' },
               { key: 'TransactionDescription', label:'Descripción', size: '12', sizeMd: '3' },
               { key: 'actions', label:'Acciones', size: '6', sizeMd: '1', type: 'actions' }, // Only view action will be available
          ];

          this.actionButtons = [
               { icon: 'eye-outline', color: 'primary', action: 'view', label: '' }
          ];

     }

     ionViewWillEnter() {
        this.LoadData();
     }

     LoadData() {
          this.isLoading.set(true);
          this.validationErrors.set(null);
          this.getTransactionsAction.Execute(this.filters).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content?.Items) {
                    this.transactions.set(res.Content.Items);
                    this.totalCount.set(res.Content.TotalCount);
               }
               this.isLoading.set(false);
               },
               error: (err) => {
               const apiError = err.error;
               if (apiError && apiError.Code === 422 && apiError.Content) {
                    this.validationErrors.set(apiError.Content);
               } else {
                    this.toastService.showError(apiError?.Message || 'Error al cargar las transacciones.');
               }
               this.isLoading.set(false);
               },
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

     ResetFilters() {
          this.filters = {
            Id: undefined,
            CostCenterId: undefined,
            TransactionType: null,
            UserId: undefined,
            IsActive: undefined,
            PageNumber: 1,
            PageSize: 10,
            StartDate: undefined,
            EndDate: undefined
          };
          this.selectedCostCenter.set(null);
          this.LoadData();
     }

     onTableAction(event: { action: string; item: TransactionResponse }) {
          if (event.action === 'view') {
               this.router.navigate(['/transactions/view', event.item.Id]);
          }
     }

     onTablePageChange(pageNumber: number) {
          this.filters.PageNumber = pageNumber;
          this.LoadData();
     }

     onTablePageSizeChange(pageSize: number) {
          this.filters.PageSize = pageSize;
          this.filters.PageNumber = 1;
          this.LoadData();
     }

     navigateToCreate() {
          this.router.navigate(['/transactions/create']);
     }
}