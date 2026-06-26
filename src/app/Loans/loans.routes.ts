import { Routes } from '@angular/router';
import { LoansComponent } from './loans.component';
import { UpdateComponent } from './UpdateLoan/update.component';
import { CreateComponent } from './CreateLoan/create.component';
import { authGuard } from '../components/layout/auth.guard';

export const loansRoutes: Routes = [
  {
    path: '',
    component: LoansComponent,
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