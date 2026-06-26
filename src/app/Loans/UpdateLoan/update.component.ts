import { forkJoin, of, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
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
import { ToastService } from 'src/app/components/toast/toast.service';
import { LoanResponse } from 'src/sdk/Responses/Loan/LoanResponse';
import { UpdateLoanAction } from 'src/sdk/Actions/Loan/UpdateLoanAction';
import { UpdateLoanRequest } from 'src/sdk/Requests/Loan/UpdateLoanRequest';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { SearchableSelectComponent } from 'src/app/components/searchable/searchable-select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GetLoansAction } from 'src/sdk/Actions/Loan/GetLoansAction';

@Component({
  selector: 'app-update-loan',
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
  @Input() id?: string; 

  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public isDataLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);
  public isSubmitted = signal<boolean>(false);

  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private updateAction: UpdateLoanAction,
    private getLoansAction: GetLoansAction,
    private toastService: ToastService,
    private getCurrenciesAction: GetCurrenciesAction,
  ) {}

  ngOnInit() {
    this.initForm();
    
    const loanId = this.id || this.route.snapshot.paramMap.get('id');
    if (loanId) {
      this.loadLoanData(Number(loanId));
    }
  }

  private initForm(data?: LoanResponse) {
    this.form = this.fb.group({
      Id: [data?.Id, Validators.required],
      LenderName: [data?.LenderName || '', Validators.required],
      PrincipalAmount: [data?.PrincipalAmount || 0, [Validators.required, Validators.min(0)]],
      InterestAmount: [data?.InterestAmount || 0, [Validators.required, Validators.min(0)]],
      TotalToRepay: [{ value: data?.TotalToRepay || 0, disabled: true }],
      RepaymentDueDate: [data?.RepaymentDueDate ? new Date(data.RepaymentDueDate).toISOString().substring(0, 10) : '', Validators.required],
      CurrencyId: [data?.CurrencyId, [Validators.required]],
      LoanStatus: [data?.LoanStatus || null, Validators.required],
    });

    const principalAmount$ = this.form.get('PrincipalAmount')!.valueChanges.pipe(startWith(this.form.get('PrincipalAmount')!.value));
    const interestAmount$ = this.form.get('InterestAmount')!.valueChanges.pipe(startWith(this.form.get('InterestAmount')!.value));

    combineLatest([principalAmount$, interestAmount$]).subscribe(([principal, interest]) => {
      const total = (Number(principal) || 0) + (Number(interest) || 0);
      this.form.get('TotalToRepay')!.setValue(total);
    });
    
    this.isSubmitted.set(false);
  }

  private loadLoanData(id: number) {
    this.isDataLoading.set(true);
    this.getLoansAction.Execute({ Id: id }).subscribe({
      next: (res) => {
        if (res.Code === 200 && res.Content?.Items?.length) {
          const loanData = res.Content.Items[0];

          forkJoin({
            currency: loanData.CurrencyId 
              ? this.getCurrenciesAction.Execute({ Id: loanData.CurrencyId, IsActive: true } as any)
              : of(null),
          }).subscribe({
            next: (deps: any) => {
              if (deps.currency?.Code === 200 && deps.currency.Content?.Items?.length) {
                this.selectedCurrency.set(deps.currency.Content.Items[0]);
              }
              
              this.initForm(loanData);
              this.isDataLoading.set(false);
            },
            error: () => {
              this.toastService.showError('Error al cargar datos de referencia');
              this.isDataLoading.set(false);
              this.cancel();
            }
          });
        } else {
          this.toastService.showError('No se encontró el préstamo');
          this.isDataLoading.set(false);
          this.cancel();
        }
      },
      error: () => {
        this.toastService.showError('Error al cargar datos del préstamo');
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

  currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
  currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';

  cancel() {
    this.router.navigate(['/loans']);
  }

  submit() {
    this.isSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors.set(null);
    this.isLoading.set(true);
    const request: UpdateLoanRequest = { ...this.form.getRawValue() };

    this.updateAction.Execute(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 201) {
          this.toastService.showSuccess('Préstamo actualizado correctamente');
          this.router.navigate(['/loans']);
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
