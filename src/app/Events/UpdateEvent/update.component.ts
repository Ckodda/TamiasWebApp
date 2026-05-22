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
  ModalController,
  IonSpinner
} from '@ionic/angular/standalone';
import { ToastService } from 'src/app/components/toast/toast.service';
import { UpdatePaymentMethodAction } from 'src/sdk/Actions/PaymentMethod/UpdatePaymentMethodAction';
import { UpdatePaymentMethodRequest } from 'src/sdk/Requests/PaymentMethod/UpdatePaymentMethodRequest';
import { PaymentMethodResponse } from 'src/sdk/Responses/PaymentMethod/PaymentMethodResponse';
import { EventResponse } from 'src/sdk/Responses/Event/EventResponse';
import { UpdateEventAction } from 'src/sdk/Actions/Event/UpdateEventAction';
import { UpdateEventRequest } from 'src/sdk/Requests/Event/UpdateEventRequest';

@Component({
  selector: 'app-update-event',
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
    IonSpinner
  ],
})
export class UpdateComponent implements OnInit {
  @Input() event!: EventResponse;

  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private updateAction: UpdateEventAction,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      Id: [this.event.Id, Validators.required],
      EventName: [this.event.EventName],
      CurrencyId: [this.event.CurrencyId],
      StartDate: [this.event.StartDate],
      TargetAmount: [this.event.TargetAmount],
      IsActive: [this.event.IsActive],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  submit() {
    this.validationErrors.set(null);
    if (this.form.invalid) return this.form.markAllAsTouched();

    this.isLoading.set(true);
    const request: UpdateEventRequest = { ...this.form.value };

    this.updateAction.Execute(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 200) this.modalController.dismiss(res.Content, 'updated');
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
          Object.keys(apiError.Content).forEach(key => {
            const control = this.form.get(key);
            if (control) { control.setErrors({ serverError: true }); control.markAsTouched(); }
          });
        } else {
          const errorMsg = apiError?.Message || 'Error de conexión o servidor.';
          this.toastService.showError(errorMsg);
        }
      }
    });
  }
}