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
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { ToastService } from '../components/toast/toast.service';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, addOutline, closeCircle } from 'ionicons/icons';
import { TableComponent, TableColumn } from '../components/table/table.component';
import { EventResponse } from 'src/sdk/Responses/Event/EventResponse';
import { GetEventsAction } from 'src/sdk/Actions/Event/GetEventsAction';
import { GetEventsRequest } from 'src/sdk/Requests/Event/GetEventsRequest';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { SearchableSelectComponent } from '../components/searchable/searchable-select.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
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
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner,
    TableComponent,
    SearchableSelectComponent,
  ],
})
export class EventsComponent implements OnInit {
  public events = signal<EventResponse[]>([]);
  public eventColumns: TableColumn[] = [];
  public totalCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);
  public filters: GetEventsRequest = {
     Id: undefined,
     EventName: '',
     CurrencyId: null as any,
     StartDate: undefined,
     IsActive: null,
     PageNumber: 1,
     PageSize: 10,
  };

  constructor(
    private getEventsAction: GetEventsAction,
    private getCurrenciesAction: GetCurrenciesAction,
    private modalController: ModalController,
    private router: Router,
    private toastService: ToastService
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, addOutline, closeCircle });
  }

  ngOnInit() {
    this.eventColumns = [
      { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
      { key: 'EventName', label: 'Nombre', size: '12', sizeMd: '2' }, // 2
      { key: 'TargetAmount', label: 'Monto', size: '12', sizeMd: '1' }, // 1
      { key: 'CurrencyCode', label: 'Moneda', size: '12', sizeMd: '1' },
      { key: 'CenterName', label: 'Centro de Costo', size: '12', sizeMd: '2' },
      { key: 'EventStatus', label: 'Estado', size: '12', sizeMd: '1' },
      { key: 'StartDate', label: 'Inicio', size: '12', sizeMd: '1' }, // Reducido a 1
      { key: 'IsActive', label: 'Activo', size: '6', sizeMd: '1', type: 'badge', cssClass: 'ion-text-start' },      
      { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-end' },
    ];
  }

  ionViewWillEnter() {
    this.LoadData();
  }

  onCurrencySearchChange(term: string) {
    if (term.length < 3) {
      this.currencies.set([]);
      this.isSearchingCurrencies.set(false);
      return;
    }

    this.isSearchingCurrencies.set(true);
    this.getCurrenciesAction.Execute({ CurrencyCode: term }).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.currencies.set(response.Content.Items);
        }
        this.isSearchingCurrencies.set(false);
      },
      error: () => {
        this.isSearchingCurrencies.set(false);
        this.currencies.set([]);
      }
    });
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
        this.isLoading.set(false); // Desactivar spinner principal
      },
      error: (err) => {
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
        }
        this.isLoading.set(false); // Desactivar spinner principal en caso de error
      },
    });
  }

  // Selecciona una moneda de la lista desplegable
  selectCurrency(currency: CurrencyResponse) {
    this.filters.CurrencyId = currency.Id as any;
    this.selectedCurrency.set(currency);
    this.currencies.set([]); // Cerramos la lista al seleccionar
    this.isSearchingCurrencies.set(false);
  }

  // Limpia la selección y vuelve al modo búsqueda
  clearCurrencySelection() {
    this.filters.CurrencyId = null as any;
    this.selectedCurrency.set(null);
  }

  ResetFilters() {
    this.filters = {
     Id: undefined,
     EventName: '',
     CurrencyId: null as any,
     StartDate: undefined,
     IsActive: null,
     PageNumber: 1,
     PageSize: 10,
    };
    this.selectedCurrency.set(null);
    this.currencies.set([]);
    this.isSearchingCurrencies.set(false);
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

  navigateToCreate() {
    this.router.navigate(['/events/create']);
  }

  async openUpdateModal(event: EventResponse) {
    this.router.navigate(['/events/edit', event.Id]);
  }

  currencyLabelFn = (item: CurrencyResponse) => item.CurrencyCode;
  currencyNoteFn = (item: CurrencyResponse) => item.CurrencyName;
}