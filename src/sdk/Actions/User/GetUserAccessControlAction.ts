import { Injectable } from '@angular/core';
import { AuthStorage } from '../../auth/AuthStorage';
import { UserCapabilitiesResponse } from '../../responses/User/UserCapabilitiesResponse';

@Injectable({
  providedIn: 'root',
})
export class GetUserAccessControlAction {
  private Capabilities: UserCapabilitiesResponse | null = null;

  constructor() {
    this.Capabilities = AuthStorage.GetCapabilities();
  }

  /**
   * Actualiza las capacidades en memoria y storage.
   */
  UpdateCapabilities(capabilities: UserCapabilitiesResponse): void {
    this.Capabilities = capabilities;
    AuthStorage.SetCapabilities(capabilities);
  }

  /**
   * Verifica si el usuario tiene un permiso específico en un módulo.
   */
  HasPermission(module: string, action: string): boolean {
    if (!this.Capabilities || !this.Capabilities.Permissions) return false;
    const modulePermissions = this.Capabilities.Permissions[module];
    return modulePermissions ? modulePermissions.includes(action) : false;
  }

  /**
   * Verifica si el usuario tiene un rol específico.
   */
  HasRole(roleName: string): boolean {
    return this.Capabilities?.Roles.includes(roleName) || false;
  }

  Clear(): void {
    this.Capabilities = null;
  }
}