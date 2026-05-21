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
import { UpdateCostCenterAction } from 'src/sdk/Actions/CostCenter/UpdateCostCenterAction';
import { UpdateCostCenterRequest } from 'src/sdk/Requests/CostCenter/UpdateCostCenter';
import { CostCenterResponse } from 'src/sdk/Responses/CostCenter/CostCenterResponse';

@Component({
  selector: 'app-update-cost-center',
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
  @Input() costCenter!: CostCenterResponse;

  public form!: FormGroup;
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private updateCostCenterAction: UpdateCostCenterAction,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      Id: [this.costCenter.Id, Validators.required],
      CodeCostCenter: [this.costCenter.CodeCostCenter],
      CenterName: [this.costCenter.CenterName],
      IsActive: [this.costCenter.IsActive],
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

    const request: UpdateCostCenterRequest = { ...this.form.value };

    this.updateCostCenterAction.Execute(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.Code === 200) {
          this.modalController.dismiss(res.Content, 'updated');
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