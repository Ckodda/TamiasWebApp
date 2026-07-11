import { forkJoin, of } from 'rxjs';
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonText,
  IonSpinner,
  IonLabel,
  IonBackButton,
  IonItem
} from '@ionic/angular/standalone';

import { SearchableSelectComponent } from '../../../app/components/searchable/searchable-select.component';
import { CurrencyResponse } from '../../../sdk/Responses/Currency/CurrencyResponse';
import { CostCenterResponse } from '../../../sdk/Responses/CostCenter/CostCenterResponse';
import { ActivatedRoute, Router } from '@angular/router';

import { UpdateEventAction } from '../../../sdk/Actions/Event/UpdateEventAction';
import { GetEventsAction } from '../../../sdk/Actions/Event/GetEventsAction';
import { GetCurrenciesAction } from '../../../sdk/Actions/Currency/GetCurrenciesAction';

import { GetCostCentersAction } from '../../../sdk/Actions/CostCenter/GetCostCentersAction';
import { UpdateEventRequest } from '../../../sdk/Requests/Event/UpdateEventRequest';
import { EventResponse } from '../../../sdk/Responses/Event/EventResponse';

import { ToastService } from '../../components/toast/toast.service';



@Component({
  selector: 'app-update-event',
  templateUrl: './update.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonSpinner,
    IonLabel,
    IonBackButton,
    SearchableSelectComponent,
    IonItem
  ],
})
export class UpdateComponent implements OnInit {
  @Input() id?: string; // Vinculado automáticamente desde la ruta

  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public isDataLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  public isSubmitted = signal<boolean>(false); // Rastreador de envío

  // Orígenes de datos para los selectores
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);

  public costCenters = signal<CostCenterResponse[]>([]);
  public selectedCostCenter = signal<CostCenterResponse | null>(null);
  public isSearchingCostCenters = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private updateAction: UpdateEventAction,
    private getEventsAction: GetEventsAction,
    private toastService: ToastService,
    private getCurrenciesAction: GetCurrenciesAction,
    private getCostCentersAction: GetCostCentersAction
  ) {}

  ngOnInit() {
    this.initForm();
    
    // Obtener ID de la ruta si no se pasa por Input
    const eventId = this.id || this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loadEventData(Number(eventId));
    }
  }

  private initForm(data?: EventResponse) {
    this.form = this.fb.group({
      Id: [data?.Id, Validators.required],
      EventName: [data?.EventName || '', Validators.required],
      CurrencyId: [data?.CurrencyId, [Validators.required]],
      CostCenterId: [data?.CostCenterId, [Validators.required]],
      StartDate: [data?.StartDate || '', Validators.required],
      TargetAmount: [data?.TargetAmount || 0, [Validators.required, Validators.min(0)]],
      EventStatus: [data?.EventStatus || '', Validators.required],
      IsActive: [data?.IsActive ?? null, Validators.required],
    });
    this.isSubmitted.set(false);
  }

  private loadEventData(id: number) {
    this.isDataLoading.set(true);
    this.getEventsAction.Execute({ Id: id }).subscribe({
      next: (res) => {
        if (res.Code === 200 && res.Content?.Items?.length) {
          const eventData = res.Content.Items[0];

          // Esperar a que se recuperen las dependencias antes de inicializar el formulario
          forkJoin({
            currency: eventData.CurrencyId 
              ? this.getCurrenciesAction.Execute({ Id: eventData.CurrencyId, IsActive: true } as any)
              : of(null),
            costCenter: eventData.CostCenterId
              ? this.getCostCentersAction.Execute({ Id: eventData.CostCenterId, IsActive: true })
              : of(null)
          }).subscribe({
            next: (deps: any) => {
              if (deps.currency?.Code === 200 && deps.currency.Content?.Items?.length) {
                this.selectedCurrency.set(deps.currency.Content.Items[0]);
              }
              if (deps.costCenter?.Code === 200 && deps.costCenter.Content?.Items?.length) {
                this.selectedCostCenter.set(deps.costCenter.Content.Items[0]);
              }
              
              this.initForm(eventData);
              this.isDataLoading.set(false);
            },
            error: () => {
              this.toastService.showError('Error al cargar datos de referencia');
              this.isDataLoading.set(false);
              this.cancel();
            }
          });
        } else {
          this.toastService.showError('No se encontró el evento');
          this.isDataLoading.set(false);
          this.cancel();
        }
      },
      error: () => {
        this.toastService.showError('Error al cargar datos del evento');
        this.isDataLoading.set(false);
        this.cancel();
      }
    });
  }

  onCurrencySearchChange(term: string) {
    if (term.length < 3) {
      this.currencies.set([]);
      this.isSearchingCurrencies.set(false);
      return;
    }
    this.isSearchingCurrencies.set(true);
    this.getCurrenciesAction.Execute({ CurrencyCode: term }).subscribe({
      next: (res) => {
        if (res.Code === 200 && res.Content) {
          this.currencies.set(res.Content.Items);
        }
        this.isSearchingCurrencies.set(false);
      },
      error: () => {
        this.isSearchingCurrencies.set(false);
        this.currencies.set([]);
      }
    });
  }

  onCostCenterSearchChange(term: string) {
    if (term.length < 3) {
      this.costCenters.set([]);
      this.isSearchingCostCenters.set(false);
      return;
    }
    this.isSearchingCostCenters.set(true);
    this.getCostCentersAction.Execute({ CenterName: term }).subscribe({
      next: (res) => {
        if (res.Code === 200 && res.Content) {
          this.costCenters.set(res.Content.Items);
        }
        this.isSearchingCostCenters.set(false);
      },
      error: () => {
        this.isSearchingCostCenters.set(false);
        this.costCenters.set([]);
      }
    });
  }

  onCostCenterSelected(item: CostCenterResponse) {
    this.selectedCostCenter.set(item);
    this.form.get('CostCenterId')?.setValue(item.Id);
    this.form.get('CostCenterId')?.markAsTouched();
  }

  onCurrencySelected(item: CurrencyResponse) {
    this.selectedCurrency.set(item);
    this.form.get('CurrencyId')?.setValue(item.Id);
    this.form.get('CurrencyId')?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }

    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
  }

  // Funciones de formato para labels
  currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
  currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';
  costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
  costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';

  cancel() {
    this.router.navigate(['/events']);
  }

  submit() {
    this.isSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors.set(null);
    this.isLoading.set(true);
    const request: UpdateEventRequest = { ...this.form.value };

    this.updateAction.Execute(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 200) {
          this.toastService.showSuccess('Evento actualizado correctamente');
          this.router.navigate(['/events']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
          Object.keys(apiError.Content).forEach(key => {
            const control = this.form.get(key);
            if (control) { 
              control.setErrors({ serverError: true }); 
              control.markAsTouched(); 
            }
          });
        } else {
          const errorMsg = apiError?.Message || 'Error de conexión o servidor.';
          this.toastService.showError(errorMsg);
        }
      }
    });
  }
}
