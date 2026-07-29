import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, signal } from "@angular/core";
import {
     IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonInput,
     IonSelect,
     IonSelectOption,
     IonText,
     IonSpinner,
     IonLabel,
     IonBackButton,
     IonItem
} from "@ionic/angular/standalone";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SearchableSelectComponent } from "src/app/components/searchable/searchable-select.component";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
import { UserResponse } from "src/sdk/Responses/Auth";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { PaymentMethodResponse } from "src/sdk/Responses/PaymentMethod/PaymentMethodResponse";
import { EventResponse } from "src/sdk/Responses/Event/EventResponse";
import { LoanResponse } from "src/sdk/Responses/Loan/LoanResponse";
import { PendingExpenseResponse } from "src/sdk/Responses/PendingExpense/PendingExpenseResponse";
import { addIcons } from "ionicons";
import { ToastService } from "src/app/components/toast/toast.service";
import { ActivatedRoute, Router } from "@angular/router";
import { GetCurrenciesAction } from "src/sdk/Actions/Currency/GetCurrenciesAction";
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import { GetEventsAction } from "src/sdk/Actions/Event/GetEventsAction";
import { GetUsersAction } from "src/sdk/Actions/User/GetUsersAction";
import { GetLoansAction } from "src/sdk/Actions/Loan/GetLoansAction";
import { GetPaymentMethodsAction } from "src/sdk/Actions/PaymentMethod/GetPaymentMethodsAction";
import { GetPendingExpensesAction } from "src/sdk/Actions/PendingExpense/GetPendingExpensesAction";
import { TransactionResponse } from "src/sdk/Responses/Transaction/TransactionResponse";
import { GetTransactionsAction } from "src/sdk/Actions/Transaction/GetTransactionsAction";
import { forkJoin, of } from "rxjs";
@Component({
     selector: 'app-view-transaction',
     standalone: true,
     templateUrl: './view.component.html',
     styleUrls: ['./view.component.scss'],
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
     ]
})
export class ViewComponent implements OnInit {
     @Input() id?: string;

     public form!: FormGroup;
     public isLoading = signal<boolean>(false);
     public isDataLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null);

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
          private route: ActivatedRoute,
          private router: Router,
          private toastService: ToastService,
          private getTransactionsAction: GetTransactionsAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getEventsAction: GetEventsAction,
          private getUsersAction: GetUsersAction,
          private getLoansAction: GetLoansAction,
          private getPaymentMethodsAction: GetPaymentMethodsAction,
          private getPendingExpensesAction: GetPendingExpensesAction
     ) {
          addIcons({});
     }

     ngOnInit() {
          this.initForm();

          const transactionId = this.id || this.route.snapshot.paramMap.get('id');
          if (transactionId) {
               this.LoadData(Number(transactionId));
          }
     }

     private initForm(data?: TransactionResponse) {
          this.form = this.fb.group({
               Id: [{ value: data?.Id, disabled: true }],
               UserId: [{ value:data?.UserId, disabled:true }],
               CostCenterId: [{ value: data?.CostCenterId, disabled:true }],
               EventId: [{ value: data?.EventId, disabled: true }],
               PendingExpenseId: [{ value: data?.PendingExpenseId, disabled: true }],
               LoanId: [{ value: data?.LoanId, disabled: true }],
               CurrencyId: [{ value: data?.CurrencyId, disabled: true }],
               PaymentMethodId: [{ value: data?.PaymentMethodId, disabled: true }],
               TransactionAmount: [{ value: data?.TransactionAmount, disabled: true }],
               TransactionType: [{ value: data?.TransactionType, disabled: true }],   
               AppliedExchangeRate: [{ value: data?.AppliedExchangeRate, disabled: true}],
               AccountingPeriod: [{ value: data?.AccountingPeriod, disabled: true }],
               TransactionDescription: [{ value: data?.TransactionDescription, disabled: true }],
               ReceiptImagePath: [{ value: data?.ReceiptImagePath, disabled: true }],
               IsActive: [{ value: data?.IsActive, disabled: true }],
               
          });
     }

     private LoadData(id: number) {
          this.isDataLoading.set(true);
          this.getTransactionsAction.Execute({ Id: id }).subscribe({
               next: (res) => {
                    if (res.Code === 200 && res.Content?.Items?.length) {
                         const transactionData = res.Content.Items[0];

                         forkJoin({
                              user: transactionData.UserId
                                   ? this.getUsersAction.Execute({ Id: transactionData.UserId, IsActive: true })
                                   : of(null),
                              costCenter: transactionData.CostCenterId
                                   ? this.getCostCentersAction.Execute({ Id: transactionData.CostCenterId, IsActive: true })
                                   : of(null),
                              currency: transactionData.CurrencyId
                                   ? this.getCurrenciesAction.Execute({ Id: transactionData.CurrencyId, IsActive: true } as any)
                                   : of(null),
                              paymentMethod: transactionData.PaymentMethodId
                                   ? this.getPaymentMethodsAction.Execute({ Id: transactionData.PaymentMethodId, IsActive: true } as any)
                                   : of(null),
                              event: transactionData.EventId
                                   ? this.getEventsAction.Execute({ Id: transactionData.EventId, IsActive: true } as any)
                                   : of(null),
                              loan: transactionData.LoanId
                                   ? this.getLoansAction.Execute({ Id: transactionData.LoanId, IsActive: true } as any)
                                   : of(null),
                              pendingExpense: transactionData.PendingExpenseId
                                   ? this.getPendingExpensesAction.Execute({ Id: transactionData.PendingExpenseId, IsActive: true } as any)
                                   : of(null)
                         }).subscribe({
                              next: (deps: any) => {
                                   if (deps.user?.Code === 200 && deps.user.Content?.Items?.length) {
                                        this.selectedUser.set(deps.user.Content.Items[0]);
                                   }
                                   if (deps.costCenter?.Code === 200 && deps.costCenter.Content?.Items?.length) {
                                        this.selectedCostCenter.set(deps.costCenter.Content.Items[0]);
                                   }
                                   if (deps.currency?.Code === 200 && deps.currency.Content?.Items?.length) {
                                        this.selectedCurrency.set(deps.currency.Content.Items[0]);
                                   }
                                   if (deps.event?.Code === 200 && deps.event.Content?.Items?.length) {
                                        this.selectedEvent.set(deps.event.Content.Items[0]);
                                   }
                                   if (deps.paymentMethod?.Code === 200 && deps.paymentMethod.Content?.Items?.length) {
                                        this.selectedPaymentMethod.set(deps.paymentMethod.Content.Items[0]);
                                   }
                                   if (deps.loan?.Code === 200 && deps.loan.Content?.Items?.length) {
                                        this.selectedLoan.set(deps.loan.Content.Items[0]);
                                   }
                                   if (deps.pendingExpense?.Code === 200 && deps.pendingExpense.Content?.Items?.length) {
                                        this.selectedPendingExpense.set(deps.pendingExpense.Content.Items[0]);
                                   }
                                   this.initForm(transactionData);
                                   this.isDataLoading.set(false);
                              },
                              error: () => {
                                   this.toastService.showError('Error al cargar datos de referencia');
                                   this.isDataLoading.set(false);
                                   this.cancel();
                              }
                         });
                    } else {
                         this.toastService.showError('No se encontró el registro');
                         this.isDataLoading.set(false);
                         this.cancel();
                    }
               },
               error: () => {
                    this.toastService.showError('Error al cargar datos del registro');
                    this.isDataLoading.set(false);
                    this.cancel();
               }
          });
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

     getErrorMessage(controlName: string): string {
          const control = this.form.get(controlName);
          if (!control) return '';
          if (control.hasError('required')) return 'Este campo es obligatorio';
          if (control.hasError('min')) return 'El valor debe ser mayor a 0';
          
          const serverErrors = this.validationErrors()?.[controlName];
          return serverErrors ? serverErrors[0] : '';
     }
     
     cancel() {
          this.router.navigate(['/transactions']);
     }
}