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

import { ToastService } from '../../components/toast/toast.service';
import { SearchableSelectComponent } from '../../components/searchable/searchable-select.component';

import { CurrencyResponse } from '../../../sdk/Responses/Currency/CurrencyResponse';
import { CostCenterResponse } from '../../../sdk/Responses/CostCenter/CostCenterResponse';
import { UpdatePendingExpenseAction } from '../../../sdk/Actions/PendingExpense/UpdatePendingExpenseAction';
import { GetPendingExpensesAction } from '../../../sdk/Actions/PendingExpense/GetPendingExpensesAction';
import { GetCurrenciesAction } from '../../../sdk/Actions/Currency/GetCurrenciesAction';
import { GetCostCentersAction } from '../../../sdk/Actions/CostCenter/GetCostCentersAction';
import { ActivatedRoute, Router } from '@angular/router';
import { PendingExpenseResponse } from '../../../sdk/Responses/PendingExpense/PendingExpenseResponse';
import { UpdatePendingExpenseRequest } from '../../../sdk/Requests/PendingExpense/UpdatePendingExpenseRequest';

@Component({
  selector: 'app-update-pending-expense',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
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
export class UpdateComponent implements OnInit
{
    @Input() id?: string; 

    public form!: FormGroup;
    public isLoading = signal<boolean>(false);
    public isDataLoading = signal<boolean>(false);
    public validationErrors = signal<any>(null);
    public isSubmitted = signal<boolean>(false); 
  
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
      private updateAction: UpdatePendingExpenseAction,
      private getPendingExpensesAction: GetPendingExpensesAction,
      private toastService: ToastService,
      private getCurrenciesAction: GetCurrenciesAction,
      private getCostCentersAction: GetCostCentersAction
    ) {}
  
    ngOnInit() {
      this.initForm();
      
      const expenseId = this.id || this.route.snapshot.paramMap.get('id');
      if (expenseId) {
        this.loadExpenseData(Number(expenseId));
      }
    }
  
    private initForm(data?: PendingExpenseResponse) {
      this.form = this.fb.group({
        Id: [data?.Id, Validators.required],
        ExpenseDescription: [data?.ExpenseDescription || '', Validators.required],
        ProviderName: [data?.ProviderName || '', Validators.required],
        TotalAmount: [data?.TotalAmount || 0, [Validators.required, Validators.min(0.01)]],
        DueDate: [data?.DueDate ? new Date(data.DueDate).toISOString().substring(0, 10) : '', Validators.required],
        CurrencyId: [data?.CurrencyId, [Validators.required]],
        CostCenterId: [data?.CostCenterId, [Validators.required]],
        PaymentStatus: [data?.PaymentStatus || 'Pending', Validators.required],
        IsActive: [data?.IsActive ?? null, Validators.required],
      });
      this.isSubmitted.set(false);
    }
  
    private loadExpenseData(id: number) {
      this.isDataLoading.set(true);
      this.getPendingExpensesAction.Execute({ Id: id }).subscribe({
        next: (res) => {
          if (res.Code === 200 && res.Content?.Items?.length) {
            const expenseData = res.Content.Items[0];
  
            forkJoin({
              currency: expenseData.CurrencyId 
                ? this.getCurrenciesAction.Execute({ Id: expenseData.CurrencyId, IsActive: true } as any)
                : of(null),
              costCenter: expenseData.CostCenterId
                ? this.getCostCentersAction.Execute({ Id: expenseData.CostCenterId, IsActive: true })
                : of(null)
            }).subscribe({
              next: (deps: any) => {
                if (deps.currency?.Code === 200 && deps.currency.Content?.Items?.length) {
                  this.selectedCurrency.set(deps.currency.Content.Items[0]);
                }
                if (deps.costCenter?.Code === 200 && deps.costCenter.Content?.Items?.length) {
                  this.selectedCostCenter.set(deps.costCenter.Content.Items[0]);
                }
                
                this.initForm(expenseData);
                this.isDataLoading.set(false);
              },
              error: () => {
                this.toastService.showError('Error al cargar datos de referencia');
                this.isDataLoading.set(false);
                this.cancel();
              }
            });
          } else {
            this.toastService.showError('No se encontró el gasto pendiente');
            this.isDataLoading.set(false);
            this.cancel();
          }
        },
        error: () => {
          this.toastService.showError('Error al cargar datos del gasto pendiente');
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
      this.getCurrenciesAction.Execute({ CurrencyCode: term, PageNumber: 1, PageSize: 20 }).subscribe({
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
      this.getCostCentersAction.Execute({ CenterName: term, PageNumber: 1, PageSize: 20 }).subscribe({
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
      if (control.hasError('min')) {
        return `El valor debe ser mayor que ${control.getError('min').min}`;
      }
  
      const serverErrors = this.validationErrors()?.[controlName];
      return serverErrors ? serverErrors[0] : '';
    }
  
    currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
    currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';
    costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
    costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';
  
    cancel() {
      this.router.navigate(['/pending-expenses']);
    }
  
    submit() {
      this.isSubmitted.set(true);
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.toastService.showError('Por favor, complete todos los campos requeridos.');
        return;
      }
  
      this.validationErrors.set(null);
      this.isLoading.set(true);
      const request: UpdatePendingExpenseRequest = { ...this.form.value };
  
      this.updateAction.Execute(request).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.Code === 200) {
            this.toastService.showSuccess('Gasto pendiente actualizado correctamente');
            this.router.navigate(['/pending-expenses']);
          } else {
            this.toastService.showError(res.Message || 'Ocurrió un error inesperado.');
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
            this.toastService.showError('Por favor, corrija los errores del formulario.');
          } else {
            const errorMsg = apiError?.Message || 'Error de conexión o servidor.';
            this.toastService.showError(errorMsg);
          }
        }
      });
    }
}
