import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, pencilOutline, trashOutline, addOutline } from 'ionicons/icons';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { GetCurrenciesRequest } from 'src/sdk/Requests/Currency/GetCurrenciesRequest';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { CreateComponent } from 'src/app/Currencies/CreateCurrency/create.component';
import { UpdateComponent } from 'src/app/Currencies/UpdateCurrency/update.component';

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [
    CommonModule,
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
    IonSpinner
  ],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.scss',
})
export class CurrenciesComponent implements OnInit {
  public currencies = signal<CurrencyResponse[]>([]);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  
  public filters: GetCurrenciesRequest = {
    Id: undefined,
    CurrencyName: '',
    CurrencyCode: '',
    IsActive: null, // Ahora el tipo es más estricto, no necesitamos 'as any'
    PageNumber: 1,
    PageSize: 10
  };

  constructor(
    private getCurrenciesAction: GetCurrenciesAction,
    private modalController: ModalController
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, pencilOutline, trashOutline, addOutline });
  }

  ngOnInit() {
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getCurrenciesAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.currencies.set(response.Content.Items);
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

  async openCreateModal() {
    const modal = await this.modalController.create({
      component: CreateComponent,
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'created') this.LoadData();
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
    if (role === 'updated') this.LoadData();
  }
}