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
  ModalController,
} from '@ionic/angular/standalone';
import { ToastService } from '../components/toast/toast.service';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, addOutline } from 'ionicons/icons';
import { GetPaymentMethodsAction } from 'src/sdk/Actions/PaymentMethod/GetPaymentMethodsAction';
import { GetPaymentMethodsRequest } from 'src/sdk/Requests/PaymentMethod/GetPaymentMethodsRequest';
import { PaymentMethodResponse } from 'src/sdk/Responses/PaymentMethod/PaymentMethodResponse';
import { TableComponent, TableColumn } from '../components/table/table.component';
import { UpdateComponent } from './UpdatePaymentMethod/update.component';
import { CreateComponent } from './CreatePaymentMethod/create.component';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './paymentmethods.component.html',
  styleUrls: ['./paymentmethods.component.scss'],
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
    TableComponent,
    UpdateComponent,
    CreateComponent
  ],
})
export class PaymentMethodsComponent implements OnInit {
  public paymentMethods = signal<PaymentMethodResponse[]>([]);
  public paymentMethodColumns: TableColumn[] = [];
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  public filters: GetPaymentMethodsRequest = {
    Id: undefined,
    MethodName: '',
    IsActive: null as any,
    PageNumber: 1,
    PageSize: 10,
  };

  constructor(
    private getPaymentMethodsAction: GetPaymentMethodsAction,
    private modalController: ModalController,
    private toastService: ToastService
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, addOutline });
  }

  ngOnInit() {
    this.paymentMethodColumns = [
      { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
      { key: 'MethodName', label: 'Nombre del Método', size: '12', sizeMd: '7' },
      { key: 'IsActive', label: 'Estado', size: '6', sizeMd: '2', type: 'badge', cssClass: 'ion-text-center' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-center' },
    ];
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getPaymentMethodsAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.paymentMethods.set(response.Content.Items);
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
      MethodName: '',
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

  onTableEdit(item: PaymentMethodResponse) {
    this.openUpdateModal(item);
  }

  onTableDelete(item: PaymentMethodResponse) {
    // Implementar lógica de eliminación futura
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

  async openUpdateModal(paymentMethod: PaymentMethodResponse) {
    const modal = await this.modalController.create({
      component: UpdateComponent,
      componentProps: { paymentMethod },
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