import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonInput, IonSelect, IonSelectOption, IonButton, IonIcon, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { GetMonthlyBalancesRequest } from '../../sdk/Requests/MonthlyBalance/GetMonthlyBalancesRequest';
import { MonthlyBalanceResponse } from '../../sdk/Responses/MonthlyBalance/MonthlyBalanceResponse';
import { GetCostCentersAction } from '../../sdk/Actions/CostCenter/GetCostCentersAction';
import { GetMonthlyBalancesAction } from '../../sdk/Actions/MonthlyBalance/GetMonthlyBalancesAction';
import { addIcons } from 'ionicons';
import { addOutline, filterOutline, pencilOutline, refreshOutline, searchOutline, trashOutline } from 'ionicons/icons';
import { CostCenterResponse } from '../../sdk/Responses/CostCenter/CostCenterResponse';
import { SearchableSelectComponent } from '../components/searchable/searchable-select.component';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';

@Component({
     selector: 'app-home',
     templateUrl: 'home.page.html',
     styleUrls: ['home.page.scss'],
     standalone: true,
     imports: [
          
          CommonModule,
          FormsModule,
          ReactiveFormsModule,
          IonContent,
          SearchableSelectComponent,
          BaseChartDirective,
          IonGrid,
          IonRow,
          IonCol,
          IonInput,
          IonSelect,
          IonSelectOption,
          IonButton,
          IonIcon,
          IonSpinner,
          IonCard,
          IonCardHeader,
          IonCardTitle,
          IonCardContent,
          IonHeader,
          IonTitle,
          IonToolbar,
     ],
})
export class HomePage implements OnInit {
     @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

     public monthlyBalances = signal<MonthlyBalanceResponse[]>([]);
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

     public monthlyClosingBalances: { month: string, closing: number, percentage: number }[] = [];
     public totalClosingBalance: { closing: number, percentage: number } = { closing: 0, percentage: 0 };

     // Bar Chart
     public barChartOptions: ChartConfiguration['options'] = {
          responsive: true,
          scales: {
               x: {},
               y: {
                    min: 0
               }
          },
          plugins: {
               legend: {
                    display: true,
               },
               datalabels: { // Solo mostrar el valor de la cantidad en el gráfico
                    display: true, // Mostrar para ambos datasets (Ingresos y Salidas)
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => {
                         return value.toFixed(2); // Solo el valor de la cantidad
                    },
                    color: 'black', // Color neutral para el texto en el gráfico
                    font: {
                         weight: 'bold'
                    },
                    textShadowBlur: 2,
                    textShadowColor: 'white'
               },
          },
          layout: {
               padding: { top: 30 }
          }
     };
     public barChartType: ChartType = 'bar';
     public barChartData: ChartData<'bar'> = {
          labels: [],
          datasets: [
               { data: [], label: 'Ingresos', backgroundColor: 'rgba(54, 162, 235, 0.8)' },
               { data: [], label: 'Salidas', backgroundColor: 'rgba(255, 205, 86, 0.8)' }
          ]
     };

     // Doughnut Chart
     public doughnutChartLabels: string[] = [];
     public doughnutChartData: ChartData<'doughnut'> = {
          labels: this.doughnutChartLabels,
          datasets: [
               {
                    data: [],
                    backgroundColor: [
                         'rgba(54, 162, 235, 0.8)',
                         'rgba(255, 205, 86, 0.8)',
                    ]
               }
          ]
     };
     public doughnutChartType: ChartType = 'doughnut';
     public doughnutChartOptions: ChartConfiguration['options'] = {
          responsive: true,
          plugins: {
               legend: {
                    display: true,
               },
               datalabels: { // Solo mostrar el valor de la cantidad en el gráfico
                    formatter: (value) => {
                         return value.toFixed(2); // Solo el valor de la cantidad
                    },
                    color: 'black', // Color neutral para el texto en el gráfico
                    font: {
                         weight: 'bold',
                         size: 14
                    },
               }
          }
     };


     constructor(
          private fb: FormBuilder,
          private getMonthlyBalancesAction: GetMonthlyBalancesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getCurrenciesAction: GetCurrenciesAction
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
               PageSize: [12]
          });
     }

     ngOnInit() {
          this.initForm();
          this.LoadData();
          Chart.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend, ChartDataLabels);
     }

     LoadData() {
          this.isSubmitted.set(true);
          this.isLoading.set(true);
          this.validationErrors.set(null);

          if (this.form.invalid) {
               this.form.markAllAsTouched();
               this.isLoading.set(false);
               // Opcional: Mostrar un toast como en el otro componente si se desea.
               // this.toastService.showError('Los filtros Mes de Inicio, Mes de Fin y Moneda son obligatorios.');
               return;
          }

          this.getMonthlyBalancesAction.Execute(this.form.value).subscribe({
               next: (response) => {
                    if (response.Code === 200 && response.Content) {
                         this.monthlyBalances.set(response.Content.Items);
                         this.totalCount.set(response.Content.TotalCount);
                         this.updateChartData(response.Content.Items);
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

     updateChartData(balances: MonthlyBalanceResponse[]) {
          const labels = balances.map(b => b.MonthPeriod);
          const incomes = balances.map(b => b.TotalIncomes ?? 0);
          const expenses = balances.map(b => b.TotalExpenses ?? 0);

          // Bar chart
          this.barChartData.labels = labels;
          this.barChartData.datasets[0].data = incomes;
          this.barChartData.datasets[1].data = expenses;

          // Calcular balances de cierre mensuales para la UI
          this.monthlyClosingBalances = balances.map((b) => {
               const closing = (b.TotalIncomes ?? 0) - (b.TotalExpenses ?? 0);
               const totalMonthActivity = (b.TotalIncomes ?? 0) + (b.TotalExpenses ?? 0);
               const percentage = totalMonthActivity > 0 ? (closing / totalMonthActivity) * 100 : 0;
               return { month: b.MonthPeriod?.toString() ?? '', closing, percentage };
          });

          // Doughnut chart - Modified to show total incomes and total expenses
          const totalIncomes = incomes.reduce((sum, current) => sum + current, 0);
          const totalExpenses = expenses.reduce((sum, current) => sum + current, 0);

          this.doughnutChartData.labels = ['Ingresos', 'Salidas'];
          this.doughnutChartData.datasets[0].data = [totalIncomes, totalExpenses];
          this.doughnutChartData.datasets[0].backgroundColor = [
               'rgba(54, 162, 235, 0.8)', // Ingresos (Blue)
               'rgba(255, 205, 86, 0.8)'  // Salidas (Yellow)
          ];

          // Calcular balance de cierre total para la UI
          const totalActivity = totalIncomes + totalExpenses;
          const totalClosing = totalIncomes - totalExpenses;
          this.totalClosingBalance = {
               closing: totalClosing,
               percentage: totalActivity > 0 ? (totalClosing / totalActivity) * 100 : 0
          };
          this.chart?.update();
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
     currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';

     ResetFilters() {
          this.isSubmitted.set(false);
          this.form.reset({ PageNumber: 1, PageSize: 12 });
          this.selectedCostCenter.set(null);
          this.selectedCurrency.set(null);
          this.LoadData();
     }

     // Chart events
     public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
          console.log(event, active);
     }

     public chartHovered({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
          console.log(event, active);
     }
}
