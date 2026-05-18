import { Component } from '@angular/core';
import { 
  IonMenu, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonRouterOutlet, 
  IonHeader, 
  IonToolbar, 
  IonTitle,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, settingsOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutService } from 'src/shared/services/LayoutService';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    IonMenu, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonRouterOutlet, 
    IonHeader, 
    IonToolbar, 
    IonTitle,
    IonIcon,
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(public LayoutService: LayoutService) {
    addIcons({ homeOutline, settingsOutline });
  }
}