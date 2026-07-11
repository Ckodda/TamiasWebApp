import { Component, OnInit, signal } from "@angular/core";
import { GetCommitmentsRequest } from "src/sdk/Requests/Commitment/GetCommitmentsRequest";
import { CommitmentResponse } from "src/sdk/Responses/Commitment/CommitmentResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
import { TableColumn, TableComponent } from "../components/table/table.component";
import { ToastService } from "../components/toast/toast.service";
import { GetCommitmentsAction } from "src/sdk/Actions/Commitment/GetCommitmentsAction";
import { Router, RouterLink } from "@angular/router";
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import { GetCurrenciesAction } from "src/sdk/Actions/Currency/GetCurrenciesAction";
import { EventResponse } from "src/sdk/Responses/Event/EventResponse";
import { GetEventsAction } from "src/sdk/Actions/Event/GetEventsAction";
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
     selector: "app-commitments",
     templateUrl: "./commitments.component.html",
     styleUrls: ["./commitments.component.css"],
     standalone: true,
     imports: [
          CommonModule,
          RouterLink,
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
export class CommitmentsComponent implements OnInit
{
     public commitments = signal<CommitmentResponse[]>([]);
     public isLoading = signal<boolean>(true);
     public validationErrors = signal<any>(null);
     public totalCount = signal<number>(0);

     public filters: GetCommitmentsRequest = {
         Id: undefined,
         CostCenterId: undefined,
         CurrencyId: undefined,
         EventId: undefined,
         CurrentStatus: null,
         PageNumber: 1,
         PageSize: 10,
       };

     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);
     public currencies = signal<CurrencyResponse[]>([]);
     public selectedCurrency = signal<CurrencyResponse | null>(null);
     public isSearchingCurrencies = signal<boolean>(false);
     public events = signal<EventResponse[]>([]);
     public selectedEvent = signal<EventResponse | null>(null);
     public isSearchingEvents = signal<boolean>(false);
     public commitmentsColumns: TableColumn[] = [];

     constructor(
          private getCommitmentsAction: GetCommitmentsAction,
          private toastService: ToastService,
          private router: Router,
          private getCostCentersAction: GetCostCentersAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private getEventsAction: GetEventsAction
     ) {
          addIcons({ addOutline, searchOutline, refreshOutline });
     }

     ngOnInit(): void {
          this.commitmentsColumns = [
               { key: 'Id', label:'ID', size: '6', sizeMd: '1' },
               { key: 'UserFullName', label:'Usuario', size: '6', sizeMd: '2' },
               { key: 'CostCenterName', label:'Centro de Costo', size: '6', sizeMd: '2' },
               { key: 'CurrencyCode', label:'Moneda', size: '6', sizeMd: '1' },
               { key: 'EventName', label:'Evento', size: '6', sizeMd: '2' },
               { key: 'CommitmentAmount', label:'Monto', size: '6', sizeMd: '1' },
               { key: 'FrequencyType', label:'Frecuencia', size: '6', sizeMd: '1' },
               { key: 'CurrentStatus', label:'Estado', size: '6', sizeMd: '1' },
               { key: 'IsActive', label:'Activo', size: '6', sizeMd: '1', type: 'badge' },
               { key: 'actions', label:'Actions', size: '6', sizeMd: '1', type: 'actions' },
          ]
     }

     ionViewWillEnter() {
        this.LoadData();
     }

     LoadData() {
          this.isLoading.set(true);
          this.validationErrors.set(null);
          this.getCommitmentsAction.Execute(this.filters).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content?.Items) {
                    this.commitments.set(res.Content.Items);
                    this.totalCount.set(res.Content.TotalCount);
               }
               this.isLoading.set(false);
               },
               error: (err) => {
               const apiError = err.error;
               if (apiError && apiError.Code === 422 && apiError.Content) {
                    this.validationErrors.set(apiError.Content);
               } else {
                    this.toastService.showError(apiError?.Message || 'Error al cargar los compromisos.');
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

     onCurrencySearchChange(term: string) {
          if (term.length < 3) {
               this.currencies.set([]);
               return;
          }
          this.isSearchingCurrencies.set(true);
          this.getCurrenciesAction.Execute({ CurrencyCode: term, PageNumber: 1, PageSize: 20 }).subscribe({
               next: (res) => {
               if (res.Content?.Items) this.currencies.set(res.Content.Items);
               this.isSearchingCurrencies.set(false);
               },
               error: () => this.isSearchingCurrencies.set(false)
          });
     }

     onCurrencySelected(item: CurrencyResponse) {
          this.selectedCurrency.set(item);
          this.filters.CurrencyId = item.Id;
     }
     currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
     currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';

     onEventSearchChange(term: string) {
          if (term.length < 3) {
               this.events.set([]);
               return;
          }
          this.isSearchingEvents.set(true);
          this.getEventsAction.Execute({ EventName: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.events.set(res.Content.Items);
               this.isSearchingEvents.set(false);
               },
               error: () => this.isSearchingEvents.set(false)
          });
     }

     onEventSelected(item: EventResponse) {
          this.selectedEvent.set(item);
          this.filters.EventId = item.Id;
     }
     eventLabelFn = (item: EventResponse | null) => item?.EventName || '';
     eventNoteFn = (item: EventResponse | null) => item?.EventName || '';

     ResetFilters() {
          this.filters = {
               Id: undefined,
               CostCenterId: undefined,
               CurrencyId: undefined,
               EventId: undefined,
               CurrentStatus: null,
               PageNumber: 1,
               PageSize: 10,
          };
          this.selectedCostCenter.set(null);
          this.LoadData();
     }

     onTableEdit(item: CommitmentResponse) {
          this.router.navigate(['/commitments/edit', item.Id]);
     }

     onTableDelete(item: CommitmentResponse) {
          // Implement delete logic with AlertController if needed
          this.toastService.showError(`La eliminación para el compromiso con ID: ${item.Id} aún no está implementada.`);
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
          this.router.navigate(['/commitments/create']);
     }
}