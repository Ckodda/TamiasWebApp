import { Component } from '@angular/core';
import { 
  IonMenu, 
  IonMenuToggle,
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
import { 
  homeOutline, 
  settingsOutline, 
  cashOutline, 
  calculatorOutline, 
  swapHorizontalOutline, 
  peopleOutline,
  documentTextOutline,
  businessOutline,
  calendarOutline,
  statsChartOutline,
  cardOutline,
  receiptOutline
} from 'ionicons/icons';
import { RouterLink, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutService } from 'src/shared/services/LayoutService';
import { MenuService } from 'src/shared/services/MenuService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    IonMenu, 
    IonMenuToggle,
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
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(
    public LayoutService: LayoutService,
    public menuService: MenuService
  ) {
    addIcons({ 
      homeOutline, 
      cashOutline, 
      calculatorOutline, 
      swapHorizontalOutline, 
      peopleOutline, 
      settingsOutline,
      documentTextOutline,
      businessOutline,
      calendarOutline,
      statsChartOutline,
      cardOutline,
      receiptOutline
    });
  }
}