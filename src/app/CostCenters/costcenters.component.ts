import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { ToastService } from '../components/toast/toast.service';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, addOutline } from 'ionicons/icons';
import { GetCostCentersAction } from 'src/sdk/Actions/CostCenter/GetCostCentersAction';
import { GetCostCentersRequest } from 'src/sdk/Requests/CostCenter/GetCostCentersRequest';
import { CostCenterResponse } from 'src/sdk/Responses/CostCenter/CostCenterResponse';
import { TableComponent, TableColumn } from '../components/table/table.component';
import { CreateComponent } from './CreateCostCenter/create.component';
import { UpdateComponent } from './UpdateCostCenter/update.component';

@Component({
  selector: 'app-cost-centers',
  templateUrl: './costcenters.component.html',
  styleUrls: ['./costcenters.component.scss'],
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
    CreateComponent, // Importamos el componente de creación
    UpdateComponent,
    TableComponent,
  ],
})
export class CostCentersComponent implements OnInit {
  public costCenters = signal<CostCenterResponse[]>([]);
  public costCenterColumns: TableColumn[] = [];
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  public filters: GetCostCentersRequest = {
    Id: undefined,
    CenterName: '',
    CodeCostCenter: '',
    IsActive: null as any,
    PageNumber: 1,
    PageSize: 10,
  };

  constructor(
    private getCostCentersAction: GetCostCentersAction,
    private modalController: ModalController,
    private toastService: ToastService
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, addOutline });
  }

  ngOnInit() {
    this.costCenterColumns = [
      { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
      { key: 'CodeCostCenter', label: 'Código', size: '12', sizeMd: '2' },
      { key: 'CenterName', label: 'Nombre', size: '12', sizeMd: '5' },
      { key: 'IsActive', label: 'Estado', size: '6', sizeMd: '2', type: 'badge', cssClass: 'ion-text-center' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-center' },
    ];
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getCostCentersAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.costCenters.set(response.Content.Items);
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
      },
    });
  }

  ResetFilters() {
    this.filters = {
      Id: undefined,
      CenterName: '',
      CodeCostCenter: '',
      IsActive: null as any,
      PageNumber: 1,
      PageSize: 10,
    };
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

  onTableEdit(item: CostCenterResponse) {
    this.openUpdateModal(item);
  }

  onTableDelete(item: CostCenterResponse) {
    // Implementar lógica de eliminación con un AlertController si es necesario
  }

  async openCreateModal() {
    const modal = await this.modalController.create({
      component: CreateComponent,
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'created') {
      this.toastService.showSuccess('Se registró correctamente');
      this.LoadData();
    }
  }

  async openUpdateModal(costCenter: CostCenterResponse) {
    const modal = await this.modalController.create({
      component: UpdateComponent,
      componentProps: { costCenter },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'updated') {
      this.toastService.showSuccess('Se actualizó correctamente');
      this.LoadData();
    }
  }
}