import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, closeOutline } from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {
    addIcons({ checkmarkCircle, alertCircle, closeOutline });
  }

  async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'light', // Fondo claro para un diseño sutil
      cssClass: 'tamias-custom-toast tamias-toast-success', // Clase para bordes en global.scss
      buttons: [
        {
          side: 'start',
          icon: 'checkmark-circle'
        },
        { icon: 'close-outline', role: 'cancel' }
      ],
      mode: 'ios',
      translucent: true
    });
    await toast.present();
  }

  async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'bottom',
      color: 'light',
      cssClass: 'tamias-custom-toast tamias-toast-error',
      buttons: [
        {
          side: 'start',
          icon: 'alert-circle'
        },
        { icon: 'close-outline', role: 'cancel' }
      ],
      mode: 'ios'
    });
    await toast.present();
  }
}