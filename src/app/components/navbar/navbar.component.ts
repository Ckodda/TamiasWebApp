import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonAvatar,
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuButton,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline } from 'ionicons/icons';
import { AuthAction } from '../../../sdk';
import { CommonModule } from '@angular/common';
import { LayoutService } from 'src/shared/services/LayoutService';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonAvatar,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuButton,
    IonChip,
  ],
})
export class NavbarComponent implements OnInit {
  FullName: string = '';
  Email: string = '';
  UserInitials: string = '';
  AvatarColor: string = 'primary';
  LogOutIcon = logOutOutline;
  MenuIcon = menuOutline;

  constructor(
    private authAction: AuthAction, 
    private router: Router,
    private LayoutService: LayoutService
  ) {
    // Registramos los iconos necesarios para componentes standalone
    addIcons({ logOutOutline, menuOutline });
  }

  ngOnInit() {
    this.LoadUserInfo();
  }

  private LoadUserInfo() {
    const user = this.authAction.GetUserData();
    if (user) {
      this.FullName = (user.FullName || 'Usuario').trim();
      this.Email = user.Email || '';
      this.UserInitials = this.authAction.GetUserInitials();
      this.AvatarColor = user.AvatarColor || 'primary';
    }
  }

  ToggleMenu() {
    this.LayoutService.ToggleMenu();
  }

  Logout() {
    this.authAction.PerformLogout().subscribe(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }

  OpenUserMenu(event: Event) {
    // El popover se abre automáticamente por el trigger ID definido en el HTML,
    // pero este método puede usarse para lógica adicional si fuera necesario.
  }
}