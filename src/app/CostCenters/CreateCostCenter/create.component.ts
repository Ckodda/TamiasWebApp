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
import { CreateCostCenterAction } from 'src/sdk/Actions/CostCenter/CreateCostCenterAction';
import { CreateCostCenterRequest } from 'src/sdk/Requests/CostCenter/CreateCostCenterRequest';

@Component({
  selector: 'app-create-cost-center',
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

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private createCostCenterAction: CreateCostCenterAction,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      CodeCostCenter: ['', Validators.required],
      CenterName: ['', Validators.required],
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio.';

    const serverErrors = this.validationErrors()?.[controlName];
    return serverErrors ? serverErrors[0] : '';
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

    this.createCostCenterAction.Execute(this.form.value as CreateCostCenterRequest).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 201) { // Asumiendo 201 para la creación exitosa
          this.modalController.dismiss(res.Content, 'created');
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
          this.validationErrors.set({ general: [errorMsg] });
          this.toastService.showError(errorMsg);
        }
      }
    });
  }
}