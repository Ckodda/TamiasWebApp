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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { addOutline, filterOutline, pencilOutline, refreshOutline, searchOutline, trashOutline } from "ionicons/icons";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import { SearchableSelectComponent } from "../components/searchable/searchable-select.component";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
import { GetCurrenciesAction } from "src/sdk/Actions/Currency/GetCurrenciesAction";

@Component({
     selector: 'app-monthly-balances',
     templateUrl: './monthlybalances.component.html',
     styleUrls: ['./monthlybalances.component.scss'],
     standalone: true,
     imports: [
          CommonModule,
          FormsModule,
          ReactiveFormsModule,
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
     public isSubmitted = signal<boolean>(false);

     public form!: FormGroup;

     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);

     public currencies = signal<CurrencyResponse[]>([]);
     public selectedCurrency = signal<CurrencyResponse | null>(null);
     public isSearchingCurrencies = signal<boolean>(false);

     constructor(
          private fb: FormBuilder,
          private getMonthlyBalancesAction: GetMonthlyBalancesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private toastService: ToastService
     ) {
          addIcons({ searchOutline, refreshOutline, filterOutline, addOutline, pencilOutline, trashOutline });
     }

     private initForm() {
          this.form = this.fb.group({
               StartMonth: [null, Validators.required],
               EndMonth: [null, Validators.required],
               CostCenterId: [null],
               CurrencyId: [null, Validators.required],
               PageNumber: [1],
               PageSize: [10]
          });
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

          this.initForm();
          this.LoadData();
     }

     LoadData(){
          this.isSubmitted.set(true);
          this.isLoading.set(true);
          this.validationErrors.set(null);

          if (this.form.invalid) {
               this.form.markAllAsTouched();
               this.toastService.showError('Los filtros Mes de Inicio, Mes de Fin y Moneda son obligatorios para realizar la búsqueda.');
               this.isLoading.set(false);
               return;
          }

          this.getMonthlyBalancesAction.Execute(this.form.value).subscribe({
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

     getErrorMessage(controlName: string): string {
          const control = this.form.get(controlName);
          if (!control || !this.isSubmitted()) return '';

          if (control.hasError('required')) return 'Este campo es obligatorio.';

          return '';
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
          this.form.get('CostCenterId')?.setValue(item.Id);
          this.form.get('CostCenterId')?.markAsTouched();
     }

     onCurrencySearchChange(term: string) {
          if (term.length < 3) {
               this.currencies.set([]);
               return;
          }
          this.isSearchingCurrencies.set(true);
          this.getCurrenciesAction.Execute({ CurrencyCode: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.currencies.set(res.Content.Items);
               this.isSearchingCurrencies.set(false);
               },
               error: () => this.isSearchingCurrencies.set(false)
          });
     }

     onCurrencySelected(item: CurrencyResponse) {
          this.selectedCurrency.set(item);
          this.form.get('CurrencyId')?.setValue(item.Id);
          this.form.get('CurrencyId')?.markAsTouched();
     }

     costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
     costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';

     currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
     currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencySymbol || '';

     ResetFilters(){
          this.isSubmitted.set(false);
          this.form.reset({ PageNumber: 1, PageSize: 10 });
          this.selectedCostCenter.set(null);
          this.selectedCurrency.set(null);
          this.LoadData();
     }

     onTablePageSizeChange(pageSize: number) {
          this.form.get('PageSize')?.setValue(pageSize);
          this.form.get('PageNumber')?.setValue(1);
          this.LoadData();
     }

     onTablePageChange(pageNumber: number) {
          this.form.get('PageNumber')?.setValue(pageNumber);
          this.LoadData();
     }
}