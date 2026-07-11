import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonToast,
  ToastController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthAction } from '../../sdk/Actions/Auth/AuthAction';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonList,
    IonCheckbox,
    IonCard,
    IonCardContent,
    IonToast,
  ],
})
export class LoginPage implements OnInit {
  @ViewChild(IonToast) Toast?: IonToast;

  LoginForm!: FormGroup;
  IsLoading = false;

  constructor(
    private Fb: FormBuilder,
    private authAction: AuthAction,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.InitializeForm();
  }

  private InitializeForm(): void {
    this.LoginForm = this.Fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  async OnLogin(): Promise<void> {
    const email = this.LoginForm.get('email')?.value;
    const password = this.LoginForm.get('password')?.value;

    // Validate form first
    const validationErrors = this.authAction.ValidateLoginRequest(email, password);

    if (validationErrors.length > 0) {
      await this.ShowToast(validationErrors[0].Message, 'danger');
      return;
    }

    this.IsLoading = true;

    this.authAction.PerformLogin(email, password).subscribe({
      next: async (response) => {
        this.IsLoading = false;
        await this.ShowToast('Sesión iniciada exitosamente', 'success');
        await this.router.navigate(['/home']);
      },
      error: async (error) => {
        this.IsLoading = false;
        const errorMessage =
          error?.Message || 'Error al iniciar sesión. Intente nuevamente.';
        await this.ShowToast(errorMessage, 'danger');
      },
    });
  }

  private async ShowToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'info' = 'info'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });
    await toast.present();
  }

  get EmailError(): string {
    const control = this.LoginForm.get('email');
    if (control?.hasError('required')) {
      return 'El correo es requerido';
    }
    if (control?.hasError('email')) {
      return 'Ingrese un correo válido';
    }
    return '';
  }

  get PasswordError(): string {
    const control = this.LoginForm.get('password');
    if (control?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'Mínimo 6 caracteres';
    }
    return '';
  }
}
