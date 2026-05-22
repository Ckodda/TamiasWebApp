import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonSelect,
  IonContent,
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
import { TableComponent, TableColumn } from '../components/table/table.component';
import { EventResponse } from 'src/sdk/Responses/Event/EventResponse';
import { GetEventsAction } from 'src/sdk/Actions/Event/GetEventsAction';
import { GetEventsRequest } from 'src/sdk/Requests/Event/GetEventsRequest';
import { CreateComponent } from './CreateEvent/create.component';
import { UpdateComponent } from './UpdateEvent/update.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonSelect,
    IonContent,
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
  ],
})
export class EventsComponent implements OnInit {
  public events = signal<EventResponse[]>([]);
  public eventColumns: TableColumn[] = [];
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  public filters: GetEventsRequest = {
     Id: undefined,
     EventName: '',
     CurrencyId: undefined,
     StartDate: undefined,
     IsActive: null,
     PageNumber: 1,
     PageSize: 10,
  };

  constructor(
    private getEventsAction: GetEventsAction,
    private modalController: ModalController,
    private toastService: ToastService
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, addOutline });
  }

  ngOnInit() {
    this.eventColumns = [
      { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
      { key: 'EventName', label: 'Nombre', size: '12', sizeMd: '3' },
      { key: 'TargetAmount', label: 'Monto', size: '12', sizeMd: '2' },
      { key: 'EventStatus', label: 'Estado', size: '12', sizeMd: '1' },
      { key: 'StartDate', label: 'Inicio', size: '12', sizeMd: '2' },
      { key: 'IsActive', label: 'Activo', size: '6', sizeMd: '1', type: 'badge', cssClass: 'ion-text-center' },
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-center' },
    ];
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getEventsAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.events.set(response.Content.Items);
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
     EventName: '',
     CurrencyId: undefined,
     StartDate: new Date().toISOString().split('T')[0],
     IsActive: null,
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

  onTableEdit(item: EventResponse) {
    this.openUpdateModal(item);
  }

  onTableDelete(item: EventResponse) {
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

  async openUpdateModal(event: EventResponse) {
    const modal = await this.modalController.create({
      component: UpdateComponent,
      componentProps: { event },
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