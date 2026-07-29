import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
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
import { ToastService } from '../components/toast/toast.service';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, addOutline } from 'ionicons/icons';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { GetCurrenciesRequest } from 'src/sdk/Requests/Currency/GetCurrenciesRequest';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { CreateComponent } from 'src/app/Currencies/CreateCurrency/create.component';
import { UpdateComponent } from 'src/app/Currencies/UpdateCurrency/update.component';
import { TableComponent, TableColumn, ActionButton } from '../components/table/table.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [
    CommonModule,
    // FormsModule se mantiene para los filtros
    FormsModule, 
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
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
    IonContent
  ],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.scss',
})
export class CurrenciesComponent implements OnInit {
  public currencies = signal<CurrencyResponse[]>([]);
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  public currencyColumns: TableColumn[] = [];
  
  public filters: GetCurrenciesRequest = {
    Id: undefined,
    CurrencyName: '',
    CurrencyCode: '',
    IsActive: null, // Ahora el tipo es más estricto, no necesitamos 'as any'
    PageNumber: 1,
    PageSize: 10
  };

  public actionButtons: ActionButton[] = [];

  constructor(
    private getCurrenciesAction: GetCurrenciesAction,
    private modalController: ModalController,
    private toastService: ToastService
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, addOutline });
  }

  ngOnInit() {
    this.currencyColumns = [
      { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
      { key: 'CurrencyCode', label: 'Código', size: '12', sizeMd: '1' },
      { key: 'CurrencyName', label: 'Nombre', size: '12', sizeMd: '4' },
      { key: 'CurrencySymbol', label: 'Símbolo', size: '12', sizeMd: '2' },
      { key: 'IsActive', label: 'Estado', size: '6', sizeMd: '2', type: 'badge', cssClass: 'ion-text-center' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-center' }
    ];
    this.actionButtons = [
      { icon: 'pencil-outline', color: 'primary', action: 'edit', label: '' },
      { icon: 'trash-outline', color: 'danger', action: 'delete', label: '' }
    ];
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getCurrenciesAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.currencies.set(response.Content.Items);
          this.totalCount.set(response.Content.TotalCount);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        // Accedemos al cuerpo de la respuesta de error enviada por el servidor
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
        }
        this.isLoading.set(false);
      }
    });
  }

  ResetFilters() {
    this.filters = { Id: undefined, CurrencyName: '', CurrencyCode: '', IsActive: null, PageNumber: 1, PageSize: 10 };
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

  onTableAction(event: { action: string; item: CurrencyResponse }) {
    if (event.action === 'edit') {
      this.openUpdateModal(event.item);
     } else if (event.action === 'delete') {
          // Implementar lógica de eliminación futura
     }
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

  async openUpdateModal(currency: CurrencyResponse) {
    const modal = await this.modalController.create({
      component: UpdateComponent,
      componentProps: { currency },
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