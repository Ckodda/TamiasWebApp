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
import { GetPendingExpenseAction } from 'src/sdk/Actions/PendingExpense/GetPendingExpenseAction';
import { GetPendingExpensesRequest } from 'src/sdk/Requests/PendingExpense/GetPendingExpensesRequest';
import { PendingExpenseResponse } from 'src/sdk/Responses/PendingExpense/PendingExpenseResponse';
import { TableColumn, TableComponent } from 'src/app/components/table/table.component';
import { ToastService } from 'src/app/components/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { CostCenterResponse } from 'src/sdk/Responses/CostCenter/CostCenterResponse';
import { GetCostCentersAction } from 'src/sdk/Actions/CostCenter/GetCostCentersAction';
import { SearchableSelectComponent } from 'src/app/components/searchable/searchable-select.component';

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

  public pendingExpensesColumns: TableColumn[] = [];

  constructor(
    private getPendingExpenseAction: GetPendingExpenseAction,
    private toastService: ToastService,
    private router: Router,
    private getCostCentersAction: GetCostCentersAction
  ) {
    addIcons({ addOutline, searchOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.pendingExpensesColumns = [
      { key: 'Id', label: 'ID', size: '12', sizeMd: '1' },
      { key: 'ExpenseDescription', label: 'Descripción', size: '12', sizeMd: '3' },
      { key: 'ProviderName', label: 'Proveedor', size: '12', sizeMd: '2' },
      { key: 'TotalAmount', label: 'Monto Total', size: '12', sizeMd: '1' },
      { key: 'DueDate', label: 'Fecha Vencimiento', size: '12', sizeMd: '2' },
      { key: 'PaymentStatus', label: 'Estado', size: '12', sizeMd: '1' },
      { key: 'IsActive', label: 'Activo', size: '6', sizeMd: '1', type: 'badge' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '1', type: 'actions' },
    ];
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

  ResetFilters() {
    this.filters = {
      PageNumber: 1,
      PageSize: 10,
      PaymentStatus: null,
      CostCenterId: undefined,
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
