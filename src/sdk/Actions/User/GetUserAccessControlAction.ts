import { Injectable, signal, WritableSignal } from '@angular/core';
import { AuthStorage } from 'src/sdk/Actions/Auth/AuthStorage';
import { UserCapabilitiesResponse } from '../../Responses/User/UserCapabilitiesResponse';

@Injectable({
  providedIn: 'root',
})
export class GetUserAccessControlAction {
  private _capabilities: WritableSignal<UserCapabilitiesResponse | null> = signal(null);

  constructor() {
    this._capabilities.set(AuthStorage.GetCapabilities());
  }

  /**
   * Expone las capacidades como un signal de solo lectura.
   */
  public get Capabilities(): WritableSignal<UserCapabilitiesResponse | null> {
    return this._capabilities;
  }

  /**
   * Actualiza las capacidades en memoria y storage.
   */
  UpdateCapabilities(capabilities: UserCapabilitiesResponse): void {
    this._capabilities.set(capabilities);
    AuthStorage.SetCapabilities(capabilities);
  }

  /**
   * Verifica si el usuario tiene un permiso específico en un módulo.
   */
  HasPermission(module: string, action: string): boolean {
    const currentCaps = this._capabilities();
    if (!currentCaps || !currentCaps.Permissions) return false;
    const modulePermissions = currentCaps.Permissions[module];
    return modulePermissions ? modulePermissions.includes(action) : false;
  }

  /**
   * Verifica si el usuario tiene un rol específico.
   */
  HasRole(roleName: string): boolean {
    const currentCaps = this._capabilities();
    return currentCaps?.Roles.includes(roleName) || false;
  }

  Clear(): void {
    this._capabilities.set(null);
  }
}