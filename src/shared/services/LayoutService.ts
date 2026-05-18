import { Injectable, signal } from '@angular/core';
import { MenuController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  constructor(private MenuController: MenuController) {}

  /**
   * Alterna el estado del menú lateral (siempre modo overlay).
   */
  public async ToggleMenu(): Promise<void> {
    await this.MenuController.toggle('main-menu');
  }
}