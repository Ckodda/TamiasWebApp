import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText, IonIcon
} from '@ionic/angular/standalone';
import { CreateLoanAction } from 'src/sdk/Actions/Loan/CreateLoanAction';
import { ToastService } from 'src/app/components/toast/toast.service';
import { SearchableSelectComponent } from 'src/app/components/searchable/searchable-select.component';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';
import { GetCurrenciesAction } from 'src/sdk/Actions/Currency/GetCurrenciesAction';
import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-create-loan',
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
  public currencies = signal<CurrencyResponse[]>([]);
  public selectedCurrency = signal<CurrencyResponse | null>(null);
  public isSearchingCurrencies = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private createLoanAction: CreateLoanAction,
    private toastService: ToastService,
    private getCurrenciesAction: GetCurrenciesAction
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      LenderName: ['', Validators.required],
      PrincipalAmount: [0, [Validators.required, Validators.min(0.01)]],
      InterestAmount: [0, [Validators.required, Validators.min(0)]],
      TotalToRepay: [{ value: 0, disabled: true }],
      RepaymentDueDate: ['', Validators.required],
      CurrencyId: [null, Validators.required],
      LoanStatus: ['Pending', Validators.required],
    });

    const principalAmount$ = this.form.get('PrincipalAmount')!.valueChanges.pipe(startWith(this.form.get('PrincipalAmount')!.value));
    const interestAmount$ = this.form.get('InterestAmount')!.valueChanges.pipe(startWith(this.form.get('InterestAmount')!.value));

    combineLatest([principalAmount$, interestAmount$]).subscribe(([principal, interest]) => {
      const total = (Number(principal) || 0) + (Number(interest) || 0);
      this.form.get('TotalToRepay')!.setValue(total);
    });
  }

  onCurrencySearchChange(term: string) {
    if (term.length < 3) {
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

  currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
  currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';

  async createLoan() {
    this.isSubmitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Por favor, complete todos los campos requeridos.');
      return;
    }

    this.isLoading.set(true);
    this.validationErrors.set(null);

    const formValue = this.form.getRawValue(); // Use getRawValue to include disabled controls

    this.createLoanAction.Execute(formValue).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.Code === 201) {
          this.toastService.showSuccess('Préstamo creado correctamente');
          this.router.navigate(['/loans']);
        } else {
          this.toastService.showError(response.Message || 'Ocurrió un error inesperado.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
          this.toastService.showError('Por favor, corrija los errores del formulario.');
        } else {
          this.toastService.showError(apiError?.Message || 'Error al crear el préstamo.');
        }
      },
    });
  }

  cancel() {
    this.router.navigate(['/loans']);
  }
}
