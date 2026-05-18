import { Injectable, computed, Signal } from '@angular/core';
import { GetUserAccessControlAction } from 'src/sdk/Actions/User/GetUserAccessControlAction';
import { MENU_ROUTES, MenuItem } from 'src/shared/routes/MenuRoutes';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  /**
   * Signal computado que realiza la intersección reactiva entre las rutas 
   * maestras y las capacidades actuales del usuario.
   */
  public readonly filteredMenu: Signal<MenuItem[]>;

  constructor(private accessControl: GetUserAccessControlAction) {
    this.filteredMenu = computed(() => {
      // Al llamar al signal de capacidades, este computed se re-evaluará 
      // automáticamente cuando las capacidades cambien.
      this.accessControl.Capabilities(); 

      return MENU_ROUTES.filter((route) => {
        if (route.IsPublic) return true;
        return this.accessControl.HasPermission(route.Module, route.Action);
      });
    });
  }

  /**
   * Retorna el menú filtrado de forma reactiva.
   */
  public GetFilteredMenu(): Signal<MenuItem[]> {
    return this.filteredMenu;
  }
}