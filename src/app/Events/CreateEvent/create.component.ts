import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText
} from '@ionic/angular/standalone';
import { CreateEventAction } from 'src/sdk/Actions/Event/CreateEventAction'; // Keep this for createEvent()
import { ToastService } from 'src/app/components/toast/toast.service'; // Keep this for toast messages
import { SearchableSelectComponent } from 'src/app/components/searchable/searchable-select.component';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { CostCenterResponse } from 'src/sdk/Responses/CostCenter/CostCenterResponse';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { GetCostCentersAction } from 'src/sdk/Actions/CostCenter/GetCostCentersAction';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText,
    SearchableSelectComponent
  ],
})
export class CreateComponent implements OnInit {
  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null); // Keep this for general form validation
  public isSubmitted = signal<boolean>(false);

  // Data sources for selects
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);
  public costCenters = signal<CostCenterResponse[]>([]);
  public selectedCostCenter = signal<CostCenterResponse | null>(null);
  public isSearchingCostCenters = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createEventAction: CreateEventAction,
    private toastService: ToastService,
    private getCurrenciesAction: GetCurrenciesAction,
    private getCostCentersAction: GetCostCentersAction
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      EventName: ['', Validators.required],
      TargetAmount: [0, [Validators.required, Validators.min(0)]],
      StartDate: ['', Validators.required],
      CostCenterId: [null, Validators.required],
      CurrencyId: [null, Validators.required],
      EventStatus: ['', Validators.required],
    });
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

  onCurrencySelected(item: CurrencyResponse) {
    this.selectedCurrency.set(item);
    this.form.get('CurrencyId')?.setValue(item.Id);
    this.form.get('CurrencyId')?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio';
    
    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
  }

  // Funciones de formato para los selectores
  currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
  currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';
  costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
  costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';

  async createEvent() {
    this.isSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.createEventAction.Execute(this.form.value).subscribe({
      next: (response) => {
        if (response.Code === 201) {
          this.toastService.showSuccess('Evento creado correctamente');
          this.router.navigate(['/events']);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
        } else {
          this.toastService.showError('Error al crear el evento');
        }
        this.isLoading.set(false);
      },
    });
  }

  cancel() {
    this.router.navigate(['/events']);
  }
}