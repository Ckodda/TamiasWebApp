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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText,
  ModalController,
  IonSpinner
} from '@ionic/angular/standalone';
import { UpdateCurrencyAction } from 'src/sdk/Actions/Currency/UpdateCurrencyAction';
import { UpdateCurrencyRequest } from 'src/sdk/Requests/Currency/UpdateCurrencyRequest';
import { CurrencyResponse } from 'src/sdk/Responses/Currency/CurrencyResponse';

@Component({
  selector: 'app-update-currency',
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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonText,
    IonSpinner
  ],
})
export class UpdateComponent implements OnInit {
  @Input() currency!: CurrencyResponse;
  
  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private updateAction: UpdateCurrencyAction
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      Id: [this.currency.Id, Validators.required],
      CurrencyName: [this.currency.CurrencyName, Validators.required],
      CurrencyCode: [this.currency.CurrencyCode, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      CurrencySymbol: [this.currency.CurrencySymbol, Validators.required],
      ExchangeRate: [this.currency.ExchangeRate, [Validators.required, Validators.min(0.00000001), Validators.pattern(/^\d+(\.\d+)?$/)]],
      IsActive: [this.currency.IsActive, Validators.required],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength') || control.hasError('maxlength')) return 'Debe tener exactamente 3 caracteres.';
    if (control.hasError('min')) return 'Debe ser un valor positivo.';
    if (control.hasError('pattern')) return 'Formato numérico inválido. Use punto para decimales.';

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

    this.updateAction.Execute(this.form.value as UpdateCurrencyRequest).subscribe({
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
            if (control) {
              control.setErrors({ serverError: true });
              control.markAsTouched();
            }
          });
        } else {
          this.validationErrors.set({ general: [apiError?.Message || 'Error de conexión o servidor.'] });
        }
      }
    });
  }
}