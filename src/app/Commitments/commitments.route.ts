import { Routes } from '@angular/router';
import { CommitmentsComponent } from './commitments.component';
import { UpdateComponent } from './UpdateCommitment/update.component';
import { CreateComponent } from './CreateCommitment/create.component';
import { authGuard } from '../components/layout/auth.guard';

export const commitmentsRoutes: Routes = [
  {
    path: '',
    component: CommitmentsComponent,
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