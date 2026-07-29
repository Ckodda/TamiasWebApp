import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText, IonItem, IonLabel, IonToggle, IonIcon
} from '@ionic/angular/standalone';
import { CurrencyResponse } from '../../../sdk/Responses/Currency/CurrencyResponse';
import { CostCenterResponse } from '../../../sdk/Responses/CostCenter/CostCenterResponse';
import { EventResponse } from '../../../sdk/Responses/Event/EventResponse';
import { LoanResponse } from '../../../sdk/Responses/Loan/LoanResponse';
import { PaymentMethodResponse } from '../../../sdk/Responses/PaymentMethod/PaymentMethodResponse';
import { UserResponse } from '../../../sdk/Responses/User/UserResponse';
import { PendingExpenseResponse } from '../../../sdk/Responses/PendingExpense/PendingExpenseResponse';
import { Router } from '@angular/router';
import { ToastService } from '../../../app/components/toast/toast.service';
import { CreateTransactionAction } from '../../../sdk/Actions/Transaction/CreateTransactionAction';
import { GetCurrenciesAction } from '../../../sdk/Actions/Currency/GetCurrenciesAction';
import { GetEventsAction } from '../../../sdk/Actions/Event/GetEventsAction';
import { GetCostCentersAction } from '../../../sdk/Actions/CostCenter/GetCostCentersAction';
import { GetLoansAction } from '../../../sdk/Actions/Loan/GetLoansAction';
import { GetPaymentMethodsAction } from '../../../sdk/Actions/PaymentMethod/GetPaymentMethodsAction';
import { GetUsersAction } from '../../../sdk/Actions/User/GetUsersAction';
import { GetPendingExpensesAction } from '../../../sdk/Actions/PendingExpense/GetPendingExpensesAction';
import { CommonModule } from '@angular/common';
import { SearchableSelectComponent } from '../../../app/components/searchable/searchable-select.component';
import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';

@Component({
  selector: "app-create-transaction",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText, IonItem, IonLabel, IonToggle,
    SearchableSelectComponent, IonIcon
  ],
})
export class CreateComponent implements OnInit
{
     public form!: FormGroup;
     public isLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null);
     public isSubmitted = signal<boolean>(false);
     
     public users = signal<UserResponse[]>([]);
     public selectedUser = signal<UserResponse | null>(null);
     public isSearchingUsers = signal<boolean>(false);
     
     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);

     public currencies = signal<CurrencyResponse[]>([]);
     public selectedCurrency = signal<CurrencyResponse | null>(null);
     public isSearchingCurrencies = signal<boolean>(false);

     public paymentMethods = signal<PaymentMethodResponse[]>([]);
     public selectedPaymentMethod = signal<PaymentMethodResponse | null>(null);
     public isSearchingPaymentMethods = signal<boolean>(false);
     
     public events = signal<EventResponse[]>([]);
     public selectedEvent = signal<EventResponse | null>(null)
     public isSearchingEvents = signal<boolean>(false);

     public loans = signal<LoanResponse[]>([]);
     public selectedLoan = signal<LoanResponse | null>(null);
     public isSearchingLoans = signal<boolean>(false);

     public pendingExpenses = signal<PendingExpenseResponse[]>([]);
     public selectedPendingExpense = signal<PendingExpenseResponse | null>(null);
     public isSearchingPendingExpenses = signal<boolean>(false);

     constructor(
          private fb: FormBuilder,
          private router: Router,
          private toastService: ToastService,
          private createTransactionAction: CreateTransactionAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getEventsAction: GetEventsAction,
          private getUsersAction: GetUsersAction,
          private getLoansAction: GetLoansAction,
          private getPaymentMethodsAction: GetPaymentMethodsAction,
          private getPendingExpensesAction: GetPendingExpensesAction
     )
     {
          addIcons({ cloudUploadOutline });
     }

     ngOnInit(): void {
          this.initForm();
     }

     private initForm() 
     {
          this.form = this.fb.group({
               UserId: [null, Validators.required],
               CostCenterId: [null, Validators.required],
               CurrencyId: [null, Validators.required],
               PaymentMethodId: [null, Validators.required],
               TransactionAmount: [0, [Validators.required, Validators.min(0.01)]],
               TransactionType: [null, Validators.required],
               TransactionDescription: [null],
               EventId: [null],
               LoanId: [null],
               PendingExpenseId: [null],
               AccountingPeriod: [null, Validators.required],
               AppliedExchangeRate: [false],
               UploadedFiles: [null]
          });
     }

     onUserSearchChange(term: string) {
      if (term.length < 3) { this.users.set([]); return; }
      this.isSearchingUsers.set(true);
      this.getUsersAction.Execute({ FullName: term }).subscribe({
           next: (res) => {
           if (res.Code === 200 && res.Content) this.users.set(res.Content.Items);
           this.isSearchingUsers.set(false);
           },
           error: () => this.isSearchingUsers.set(false)
      });
     }

     onUserSelected(item: UserResponse) {
          this.selectedUser.set(item);
          this.form.get('UserId')?.setValue(item.Id);
     }

     onCostCenterSearchChange(term: string) {
      if (term.length < 3) { this.costCenters.set([]); return; }
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
     }

     onCurrencySearchChange(term: string) {
          if (term.length < 3) { this.currencies.set([]); return; }
          this.isSearchingCurrencies.set(true);
          this.getCurrenciesAction.Execute({ CurrencyCode: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.currencies.set(res.Content.Items);
               this.isSearchingCurrencies.set(false);
               },
               error: () => this.isSearchingCurrencies.set(false)
          });
     }

     onCurrencySelected(item: CurrencyResponse) {
          this.selectedCurrency.set(item);
          this.form.get('CurrencyId')?.setValue(item.Id);
     }

     onPaymentMethodSearchChange(term: string) {
          if (term.length < 3) { this.paymentMethods.set([]); return; }
          this.isSearchingPaymentMethods.set(true);
          this.getPaymentMethodsAction.Execute({ MethodName: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.paymentMethods.set(res.Content.Items);
               this.isSearchingPaymentMethods.set(false);
               },
               error: () => this.isSearchingPaymentMethods.set(false)
          });
     }

     onPaymentMethodSelected(item: PaymentMethodResponse) {
          this.selectedPaymentMethod.set(item);
          this.form.get('PaymentMethodId')?.setValue(item.Id);
     }

     onEventSearchChange(term: string) {
          if (term.length < 3) { this.events.set([]); return; }
          this.isSearchingEvents.set(true);
          this.getEventsAction.Execute({ EventName: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.events.set(res.Content.Items);
               this.isSearchingEvents.set(false);
               },
               error: () => this.isSearchingEvents.set(false)
          });
     }

     onEventSelected(item: EventResponse) {
          this.selectedEvent.set(item);
          this.form.get('EventId')?.setValue(item.Id);
     }

     onLoanSearchChange(term: string) {
          if (term.length < 3) { this.loans.set([]); return; }
          this.isSearchingLoans.set(true);
          this.getLoansAction.Execute({ LenderName: term }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.loans.set(res.Content.Items);
               this.isSearchingLoans.set(false);
               },
               error: () => this.isSearchingLoans.set(false)
          });
     }

     onLoanSelected(item: LoanResponse) {
          this.selectedLoan.set(item);
          this.form.get('LoanId')?.setValue(item.Id);
     }
     
     onPendingExpenseSearchChange(term: string) {
          if (term.length < 3) { this.pendingExpenses.set([]); return; }
          this.isSearchingPendingExpenses.set(true);
          this.getPendingExpensesAction.Execute({ ProviderName: term, PaymentStatus: 'Pending' }).subscribe({
               next: (res) => {
               if (res.Code === 200 && res.Content) this.pendingExpenses.set(res.Content.Items);
               this.isSearchingPendingExpenses.set(false);
               },
               error: () => this.isSearchingPendingExpenses.set(false)
          });
     }

     onPendingExpenseSelected(item: PendingExpenseResponse) {
          this.selectedPendingExpense.set(item);
          this.form.get('PendingExpenseId')?.setValue(item.Id);
     }

     onFileChange(event: any) {
          const files = event.target.files;
          if (files.length > 0) {
            this.form.get('UploadedFiles')?.setValue(files);
          }
     }

     getErrorMessage(controlName: string): string {
          const control = this.form.get(controlName);
          if (!control || !this.isSubmitted()) return '';
          if (control.hasError('required')) return 'Este campo es obligatorio';
          if (control.hasError('min')) return 'El valor debe ser mayor a 0';
          
          const serverErrors = this.validationErrors()?.[controlName];
          return serverErrors ? serverErrors[0] : '';
     }

     userLabelFn = (item: UserResponse | null) => item?.FullName || '';
     userNoteFn = (item: UserResponse | null) => item?.Email || '';
     costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
     costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';
     currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
     currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';
     paymentMethodLabelFn = (item: PaymentMethodResponse | null) => item?.MethodName || '';
     paymentMethodNoteFn = (item: PaymentMethodResponse | null) => String(item?.Id) || '';
     eventLabelFn = (item: EventResponse | null) => item?.EventName || '';
     eventNoteFn = (item: EventResponse | null) => String(item?.Id) || '';
     loanLabelFn = (item: LoanResponse | null) => `${item?.LenderName} - ${item?.PrincipalAmount}` || '';
     loanNoteFn = (item: LoanResponse | null) => `ID: ${item?.Id}` || '';
     pendingExpenseLabelFn = (item: PendingExpenseResponse | null) => `${item?.ProviderName} - ${item?.TotalAmount}` || '';
     pendingExpenseNoteFn = (item: PendingExpenseResponse | null) => `ID: ${item?.Id}` || '';

     async createTransaction() {
          this.isSubmitted.set(true);
          this.form.markAllAsTouched();
          if (this.form.invalid) {
               return;
          }

          this.isLoading.set(true);
          this.validationErrors.set(null);


          this.createTransactionAction.Execute(this.form.value).subscribe({
               next: (response) => {
               if (response.Code === 201) {
                    this.toastService.showSuccess('Transacción creada correctamente');
                    this.router.navigate(['/transactions']);
               }
               this.isLoading.set(false);
               },
               error: (err) => {
               const apiError = err.error;
               if (apiError && apiError.Code === 422 && apiError.Content) {
                    this.validationErrors.set(apiError.Content);
                    Object.keys(apiError.Content).forEach(key => {
                         const control = this.form.get(key);
                         if (control) {
                              control.setErrors({ serverError: true });
                         }
                    });
               } else {
                    this.toastService.showError('Error al crear la transacción');
               }
               this.isLoading.set(false);
               },
          });
     }

     cancel() {
          this.router.navigate(['/transactions']);
     }
}
