import { Component, Input, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from "@angular/router";
import { ToastService } from "../../../app/components/toast/toast.service";
import { UpdateCommitmentAction } from "../../../sdk/Actions/Commitment/UpdateCommitmentAction";
import { GetCostCentersAction } from "../../../sdk/Actions/CostCenter/GetCostCentersAction";
import { GetCurrenciesAction } from "../../../sdk/Actions/Currency/GetCurrenciesAction";
import { GetEventsAction } from "../../../sdk/Actions/Event/GetEventsAction";
import { CurrencyResponse } from "src/sdk/Responses/Currency/CurrencyResponse";
import { CostCenterResponse } from "src/sdk/Responses/CostCenter/CostCenterResponse";
import { EventResponse } from "src/sdk/Responses/Event/EventResponse";
import { GetUsersAction } from "src/sdk/Actions/User/GetUsersAction";
import { UserResponse } from "src/sdk/Responses/Auth";
import { forkJoin, of } from "rxjs";
import { GetCommitmentsAction } from "src/sdk/Actions/Commitment/GetCommitmentsAction";
import { CommitmentResponse } from "src/sdk/Responses/Commitment/CommitmentResponse";
import { UpdateCommitmentRequest } from "src/sdk/Requests/Commitment/UpdateCommitmentRequest";
import { SearchableSelectComponent } from "src/app/components/searchable/searchable-select.component";
import { CommonModule } from "@angular/common";

@Component({
     selector: "app-update-commitment",
     templateUrl: "./update.component.html",
     styleUrls: ["./update.component.scss"],
     standalone: true,
     imports:[
          CommonModule,
          ReactiveFormsModule,
          IonSpinner,
          IonButton,
          IonText,
          IonBackButton,
          IonHeader,
          IonToolbar,
          IonTitle,
          IonContent,
          IonInput,
          IonButtons,
          IonSelect,
          IonSelectOption,
          SearchableSelectComponent
     ]
})

export class UpdateComponent implements OnInit {
     @Input() id?: string;

     public form!: FormGroup;
     public isLoading = signal<boolean>(false);
     public isDataLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null); // Keep this for general form validation
     public isSubmitted = signal<boolean>(false);

     public currencies = signal<CurrencyResponse[]>([]);
     public selectedCurrency = signal<CurrencyResponse | null>(null)
     public isSearchingCurrencies = signal<boolean>(false);

     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);

     public events = signal<EventResponse[]>([]);
     public selectedEvent = signal<EventResponse | null>(null);
     public isSearchingEvents = signal<boolean>(false);

     public users = signal<UserResponse[]>([]);
     public selectedUser = signal<UserResponse | null>(null);
     public isSearchingUsers = signal<boolean>(false);

     constructor(
          private fb: FormBuilder,
          private route: ActivatedRoute,
          private router: Router,
          private updateAction: UpdateCommitmentAction,
          private toastService: ToastService,
          private getCommitmentsAction: GetCommitmentsAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getEventsAction: GetEventsAction,
          private getUsersAction: GetUsersAction
     ) { }

     ngOnInit(): void {
          this.initForm();
          const commitmentId = this.id || this.route.snapshot.paramMap.get('id');
          if (commitmentId) {
               this.loadCommitmentData(Number(commitmentId));
          }
     }

     private loadCommitmentData(id: number) {
          this.isDataLoading.set(true);
          this.getCommitmentsAction.Execute({ Id: id }).subscribe({
               next: (res) => {
                    if (res.Code === 200 && res.Content?.Items?.length) {
                         const commitmentData = res.Content.Items[0];

                         // Esperar a que se recuperen las dependencias antes de inicializar el formulario
                         forkJoin({
                              currency: commitmentData.CurrencyId
                                   ? this.getCurrenciesAction.Execute({ Id: commitmentData.CurrencyId, IsActive: true } as any)
                                   : of(null),
                              costCenter: commitmentData.CostCenterId
                                   ? this.getCostCentersAction.Execute({ Id: commitmentData.CostCenterId, IsActive: true })
                                   : of(null),
                              event: commitmentData.EventId
                                   ? this.getCostCentersAction.Execute({ Id: commitmentData.CostCenterId, IsActive: true })
                                   : of(null),
                              user: commitmentData.UserId
                                   ? this.getUsersAction.Execute({ Id: commitmentData.UserId, IsActive: true })
                                   : of(null)
                         }).subscribe({
                              next: (deps: any) => {
                                   if (deps.currency?.Code === 200 && deps.currency.Content?.Items?.length) {
                                        this.selectedCurrency.set(deps.currency.Content.Items[0]);
                                   }
                                   if (deps.costCenter?.Code === 200 && deps.costCenter.Content?.Items?.length) {
                                        this.selectedCostCenter.set(deps.costCenter.Content.Items[0]);
                                   }
                                   if (deps.event?.Code === 200 && deps.event.Content?.Items?.length) {
                                        this.selectedEvent.set(deps.event.Content.Items[0]);
                                   }
                                   this.initForm(commitmentData);
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

     private initForm(data?: CommitmentResponse) {
          this.form = this.fb.group({
               Id: [data?.Id, Validators.required],
               UserId: [data?.UserId, Validators.required],
               CostCenterId: [data?.CostCenterId, Validators.required],
               CurrencyId: [data?.CurrencyId, Validators.required],
               EventId: [data?.EventId, Validators.nullValidator],
               CommitmentAmount: [data?.CommitmentAmount, [Validators.required, Validators.min(0)]],
               FrequencyType: [data?.FrequencyType, Validators.required],
               CurrentStatus: [data?.CurrentStatus, Validators.required],
               IsActive: [data?.IsActive ?? null, Validators.required],
          });
          this.isSubmitted.set(false);
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

     onEventSearchChange(term: string) {
          if (term.length < 3) {
               this.events.set([]);
               return;
          }
          this.isSearchingEvents.set(true);
          this.getEventsAction.Execute({ EventName: term }).subscribe({
               next: (res) => {
                    if (res.Code === 200 && res.Content) this.events.set(res.Content.Items);
                    this.isSearchingEvents.set(false);
               },
               error: () => this.isSearchingEvents.set(false)
          });
     }

     onUserSearchChange(term: string) {
          if (term.length < 3) {
               this.users.set([]);
               return;
          }
          this.isSearchingUsers.set(true);
          this.getUsersAction.Execute({ FullName: term, Email: term }).subscribe({
               next: (res) => {
                    if (res.Code === 200 && res.Content) this.users.set(res.Content.Items);
                    this.isSearchingUsers.set(false);
               },
               error: () => this.isSearchingUsers.set(false)
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

     onEventSelected(item: EventResponse) {
          this.selectedEvent.set(item);
          this.form.get('EventId')?.setValue(item.Id);
          this.form.get('EventId')?.markAsTouched();
     }

     onUserSelected(item: UserResponse) {
          this.selectedUser.set(item);
          this.form.get('UserId')?.setValue(item.Id);
          this.form.get('UserId')?.markAsTouched();
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
     costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
     costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';
     eventLabelFn = (item: EventResponse | null) => item?.EventName || '';
     eventNoteFn = (item: EventResponse | null) => item?.Id.toString() || '';
     userLabelFn = (item: UserResponse | null) => item?.FullName || '';
     userNoteFn = (item: UserResponse | null) => item?.Id.toString() || '';

     cancel() {
          this.router.navigate(['/commitments']);
     }

     submit() {
          this.isSubmitted.set(true);
          if (this.form.invalid) {
               this.form.markAllAsTouched();
               return;
          }

          this.validationErrors.set(null);
          this.isLoading.set(true);
          const request: UpdateCommitmentRequest = { ...this.form.value };

          this.updateAction.Execute(request).subscribe({
               next: (res) => {
                    this.isLoading.set(false);
                    if (res.Code === 200) {
                         this.toastService.showSuccess('Registro actualizado correctamente');
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