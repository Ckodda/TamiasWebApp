import { Routes } from '@angular/router';
import { EventsComponent } from './events.component';
import { UpdateComponent } from './UpdateEvent/update.component';
import { CreateComponent } from './CreateEvent/create.component';

export const eventsRoutes: Routes = [
  {
    path: '',
    component: EventsComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
  {
    path: 'edit/:id',
    component: UpdateComponent,
  }
];