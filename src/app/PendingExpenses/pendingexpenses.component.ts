import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
import { addIcons } from 'ionicons';
import { addOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../components/table/table.component';
import { SearchableSelectComponent } from '../components/searchable/searchable-select.component';
import { PendingExpenseResponse } from '../../sdk/Responses/PendingExpense/PendingExpenseResponse';
import { GetPendingExpensesRequest } from '../../sdk/Requests/PendingExpense/GetPendingExpensesRequest';
import { GetPendingExpensesAction } from '../../sdk/Actions/PendingExpense/GetPendingExpensesAction';
import { CostCenterResponse } from '../../sdk/Responses/CostCenter/CostCenterResponse';
import { GetCostCentersAction } from '../../sdk/Actions/CostCenter/GetCostCentersAction';
import { CurrencyResponse } from '../../sdk/Responses/Currency/CurrencyResponse';
import { GetCurrenciesAction } from '../../sdk/Actions/Currency/GetCurrenciesAction';

import { ToastService } from '../components/toast/toast.service';

@Component({
  selector: 'app-pendingexpenses',
  templateUrl: './pendingexpenses.component.html',
  styleUrls: ['./pendingexpenses.component.scss'],
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
export class PendingExpensesComponent implements OnInit {
  public pendingExpenses = signal<PendingExpenseResponse[]>([]);
  public isLoading = signal<boolean>(true);
  public validationErrors = signal<any>(null);
  public totalCount = signal<number>(0);

  public filters: GetPendingExpensesRequest = {
    Id: undefined,
    CostCenterId: undefined,
    CurrencyId: undefined,
    PaymentStatus: null,
    ProviderName: '',
    StartDate: '',
    EndDate: '',
    PageNumber: 1,
    PageSize: 10,
  };

  public costCenters = signal<CostCenterResponse[]>([]);
  public selectedCostCenter = signal<CostCenterResponse | null>(null);
  public isSearchingCostCenters = signal<boolean>(false);
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);
  public pendingExpensesColumns: TableColumn[] = [];

  constructor(
    private getPendingExpenseAction: GetPendingExpensesAction,
    private toastService: ToastService,
    private router: Router,
    private getCostCentersAction: GetCostCentersAction,
    private getCurrenciesAction: GetCurrenciesAction
  ) {
    addIcons({ addOutline, searchOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.pendingExpensesColumns = [
      { key: 'Id', label: 'ID', size: '6', sizeMd: '1' },
      { key: 'ExpenseDescription', label: 'Descripción', size: '12', sizeMd: '2' },
      { key: 'ProviderName', label: 'Proveedor', size: '6', sizeMd: '2' },
      { key: 'TotalAmount', label: 'Monto Total', size: '6', sizeMd: '1' },
      { key: 'DueDate', label: 'Fecha Vencimiento', size: '6', sizeMd: '1' },
      { key: 'CostCenterName', label: 'Centro de Costo', size: '6', sizeMd: '2' },
      { key: 'PaymentStatus', label: 'Estado', size: '6', sizeMd: '1' },
      { key: 'CurrencyCode', label: 'Moneda', size: '6', sizeMd: '1' },
      { key: 'IsActive', label: 'Activo', size: '6', sizeMd: '1', type: 'badge' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '1', type: 'actions' },
    ];
  }

  ionViewWillEnter() {
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);
    this.getPendingExpenseAction.Execute(this.filters).subscribe({
      next: (res) => {
        if (res.Code === 200 && res.Content?.Items) {
          this.pendingExpenses.set(res.Content.Items);
          this.totalCount.set(res.Content.TotalCount);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
        } else {
          this.toastService.showError(apiError?.Message || 'Error al cargar los gastos pendientes.');
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

  ResetFilters() {
    this.filters = {
      PageNumber: 1,
      PageSize: 10,
      PaymentStatus: null,
      CostCenterId: undefined,
      CurrencyId: undefined,
    };
    this.selectedCostCenter.set(null);
    this.LoadData();
  }

  onTableEdit(item: PendingExpenseResponse) {
    this.router.navigate(['/pending-expenses/edit', item.Id]);
  }

  onTableDelete(item: PendingExpenseResponse) {
    // Implement delete logic with AlertController if needed
    this.toastService.showError(`La eliminación para el gasto con ID: ${item.Id} aún no está implementada.`);
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
    this.router.navigate(['/pending-expenses/create']);
  }
}
