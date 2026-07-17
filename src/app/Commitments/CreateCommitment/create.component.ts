import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText
} from '@ionic/angular/standalone';
import { CurrencyResponse } from '../../../sdk/Responses/Currency/CurrencyResponse';
import { CostCenterResponse } from '../../../sdk/Responses/CostCenter/CostCenterResponse';
import { EventResponse } from '../../../sdk/Responses/Event/EventResponse';
import { Router } from '@angular/router';
import { ToastService } from '../../../app/components/toast/toast.service';
import { CreateCommitmentAction } from '../../../sdk/Actions/Commitment/CreateCommitmentAction';
import { GetCurrenciesAction } from '../../../sdk/Actions/Currency/GetCurrenciesAction';
import { GetEventsAction } from '../../../sdk/Actions/Event/GetEventsAction';
import { GetCostCentersAction } from '../../../sdk/Actions/CostCenter/GetCostCentersAction';
import { UserResponse } from '../../../sdk/Responses/User/UserResponse';
import { GetUsersAction } from '../../../sdk/Actions/User/GetUsersAction';
import { CommonModule } from '@angular/common';
import { SearchableSelectComponent } from '../../../app/components/searchable/searchable-select.component';

@Component({
  selector: "app-create-commitment",
  templateUrl: "./create.component.html",
  styleUrls: ["./create.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonButtons, IonSpinner, IonSelect, IonSelectOption, IonBackButton, IonText,
    SearchableSelectComponent
  ],
})
export class CreateComponent implements OnInit
{
     public form!: FormGroup;
     public isLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null); // Keep this for general form validation
     public isSubmitted = signal<boolean>(false);
     
     public currencies = signal<CurrencyResponse[]>([]);
     public selectedCurrency = signal<CurrencyResponse | null>(null);
     public isSearchingCurrencies = signal<boolean>(false);
     public costCenters = signal<CostCenterResponse[]>([]);
     public selectedCostCenter = signal<CostCenterResponse | null>(null);
     public isSearchingCostCenters = signal<boolean>(false);
     public events = signal<EventResponse[]>([]);
     public selectedEvent = signal<EventResponse | null>(null)
     public isSearchingEvents = signal<boolean>(false);

     public users = signal<UserResponse[]>([]); 
     public selectedUser = signal<UserResponse | null>(null);
     public isSearchingUsers = signal<boolean>(false);

     constructor(
          private fb: FormBuilder,
          private router: Router,
          private toastService: ToastService,
          private createCommitmentAction: CreateCommitmentAction,
          private getCurrenciesAction: GetCurrenciesAction,
          private getCostCentersAction: GetCostCentersAction,
          private getEventsAction: GetEventsAction,
          private getUsersAction: GetUsersAction
     )
     { }

     ngOnInit(): void {
          this.initForm();
     }

     private initForm() 
     {
          this.form = this.fb.group({
               UserId: [null, Validators.required],
               CostCenterId: [null, Validators.required],
               CurrencyId: [null, Validators.required],
               EventId: [null, Validators.nullValidator],
               CommitmentAmount: [0, [Validators.required, Validators.min(0)]],
               FrequencyType: [null, Validators.required],
               CurrentStatus: [null, Validators.required]
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
          this.getUsersAction.Execute({ FullName: term }).subscribe({
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
          if (control.hasError('required')) return 'Este campo es obligatorio';
          
          const serverErrors = this.validationErrors()?.[controlName];
          return serverErrors ? serverErrors[0] : '';
     }

     currencyLabelFn = (item: CurrencyResponse | null) => item?.CurrencyCode || '';
     currencyNoteFn = (item: CurrencyResponse | null) => item?.CurrencyName || '';
     costCenterLabelFn = (item: CostCenterResponse | null) => item?.CodeCostCenter || '';
     costCenterNoteFn = (item: CostCenterResponse | null) => item?.CenterName || '';
     eventLabelFn = (item: EventResponse | null) => item?.EventName || '';
     eventNoteFn = (item: EventResponse | null) => String(item?.Id) || '';
     userLabelFn = (item: UserResponse | null) => item?.FullName || '';
     userNoteFn = (item: UserResponse | null) => item?.Email || '';

     async createCommitment() {
          this.isSubmitted.set(true);
          if (this.form.invalid) {
               this.form.markAllAsTouched();
               return;
          }

          this.isLoading.set(true);
          this.validationErrors.set(null);

          this.createCommitmentAction.Execute(this.form.value).subscribe({
               next: (response) => {
               if (response.Code === 201) {
                    this.toastService.showSuccess('Commitment creado correctamente');
                    this.router.navigate(['/commitments']);
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
                    this.toastService.showError('Error al crear el commitment');
               }
               this.isLoading.set(false);
               },
          });
     }

     cancel() {
          this.router.navigate(['/commitments']);
     }
}