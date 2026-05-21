import { Component, OnInit, signal } from '@angular/core';
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
  IonText,
  ModalController,
  IonSpinner
} from '@ionic/angular/standalone';
import { ToastService } from 'src/app/components/toast/toast.service';
import { CreateCurrencyAction } from 'src/sdk/Actions/Currency/CreateCurrencyAction';
import { CreateCurrencyRequest } from 'src/sdk/Requests/Currency/CreateCurrencyRequest';

@Component({
  selector: 'app-create-currency',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
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
    IonText,
    IonSpinner
  ],
})
export class CreateComponent implements OnInit {
  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    // Errores de validación local (Angular)
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('minlength') || control.hasError('maxlength')) return 'Debe tener exactamente 3 caracteres.';
    if (control.hasError('min')) return 'Debe ser un valor positivo.';
    if (control.hasError('pattern')) return 'Formato numérico inválido. Use punto para decimales.';

    // Errores de validación del servidor (API)
    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
  }

  // Helper para acceder fácilmente a los controles en el template
  get f() {
    return this.form.controls;
  }

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private createAction: CreateCurrencyAction,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      CurrencyName: ['', Validators.required],
      CurrencyCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      CurrencySymbol: ['', Validators.required],
      ExchangeRate: [null, [Validators.required, Validators.min(0.00000001), Validators.pattern(/^\d+(\.\d+)?$/)]],
    });
  }

  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }

  submit() {
    this.validationErrors.set(null);

    if (this.form.invalid) {
      return this.form.markAllAsTouched();
    }

    this.isLoading.set(true);

    this.createAction.Execute(this.form.value as CreateCurrencyRequest).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 201) this.modalController.dismiss(res.Content, 'created');
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
          // Marcamos los controles con error del servidor como inválidos para que Ionic muestre el errorText
          Object.keys(apiError.Content).forEach(key => {
            const control = this.form.get(key);
            if (control) {
              control.setErrors({ serverError: true });
              control.markAsTouched();
            }
          });
        } else {
            const errorMsg = apiError?.Message || 'Error de conexión o servidor.';
            this.validationErrors.set({ general: [errorMsg] });
            this.toastService.showError(errorMsg);
        }
      }
    });
  }
}