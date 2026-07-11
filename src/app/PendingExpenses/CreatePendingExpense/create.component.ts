import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText, IonIcon
} from '@ionic/angular/standalone';

import { SearchableSelectComponent } from '../../components/searchable/searchable-select.component';
import { ToastService } from '../../components/toast/toast.service';
import { CostCenterResponse } from '../../../sdk/Responses/CostCenter/CostCenterResponse';
import { CurrencyResponse } from '../../../sdk/Responses/Currency/CurrencyResponse';
import { CreatePendingExpenseAction } from '../../../sdk/Actions/PendingExpense/CreatePendingExpenseAction';
import { GetCostCentersAction } from '../../../sdk/Actions/CostCenter/GetCostCentersAction';
import { GetCurrenciesAction } from '../../../sdk/Actions/Currency/GetCurrenciesAction';

@Component({
  selector: 'app-create-pending-expense',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText, IonIcon,
    SearchableSelectComponent,
  ],
})
export class CreateComponent implements OnInit {
  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  public isSubmitted = signal<boolean>(false);

  // Data sources for selects
  public costCenters = signal<CostCenterResponse[]>([]);
  public selectedCostCenter = signal<CostCenterResponse | null>(null);
  public isSearchingCostCenters = signal<boolean>(false);
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createPendingExpenseAction: CreatePendingExpenseAction,
    private toastService: ToastService,
    private getCostCentersAction: GetCostCentersAction,
    private getCurrenciesAction: GetCurrenciesAction
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      ExpenseDescription: ['', Validators.required],
      TotalAmount: [0, [Validators.required, Validators.min(0.01)]],
      DueDate: ['', Validators.required],
      ProviderName: ['', Validators.required],
      CostCenterId: [null, Validators.required],
      CurrencyId: [null, Validators.required],
      PaymentStatus: ['Pending', Validators.required],
    });
  }

  onCostCenterSearchChange(term: string) {
    if (term.length < 2) {
      this.costCenters.set([]);
      return;
    }
    this.isSearchingCostCenters.set(true);
    this.getCostCentersAction.Execute({ CenterName: term, PageNumber: 1, PageSize: 20 }).subscribe({
      next: (res) => {
        if (res.Content?.Items) this.costCenters.set(res.Content.Items);
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

  onCurrencySearchChange(term: string) {
    if (term.length < 2) {
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
     this.form.get('CurrencyId')?.setValue(item.Id);
     this.form.get('CurrencyId')?.markAsTouched();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !this.isSubmitted()) return '';
    
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('min')) return `El valor debe ser mayor a ${control.errors?.['min'].min}.`;

    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
  }

  costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
  costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';
  currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
  currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';

  async createPendingExpense() {
    this.isSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Por favor, complete todos los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    this.validationErrors.set(null);

    const formValue = this.form.getRawValue();

    this.createPendingExpenseAction.Execute(formValue).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.Code === 201) {
          this.toastService.showSuccess('Gasto pendiente creado correctamente');
          this.router.navigate(['/pending-expenses']);
        } else {
          this.toastService.showError(response.Message || 'Ocurrió un error inesperado.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
          this.toastService.showError('Por favor, corrija los errores del formulario.');
        } else {
          this.toastService.showError(apiError?.Message || 'Error al crear el gasto pendiente.');
        }
        this.isLoading.set(false);
      },
    });
  }
  cancel() {
    this.router.navigate(['/pending-expenses']);
  }
}
