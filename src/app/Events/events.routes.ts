import { Routes } from '@angular/router';
import { EventsComponent } from './events.component';
import { UpdateComponent } from './UpdateEvent/update.component';
import { CreateComponent } from './CreateEvent/create.component';
import { authGuard } from '../components/layout/auth.guard';

export const eventsRoutes: Routes = [
  {
    path: '',
    component: EventsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create',
    component: CreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'edit/:id',
    component: UpdateComponent,
    canActivate: [authGuard]
  }
];