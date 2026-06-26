import { Routes } from '@angular/router';
import { PendingExpensesComponent } from './pendingexpenses.component';
import { UpdateComponent } from './UpdatePendingExpense/update.component';
import { CreateComponent } from './CreatePendingExpense/create.component';
import { authGuard } from '../components/layout/auth.guard';

export const pendingExpensesRoutes: Routes = [
  {
    path: '',
    component: PendingExpensesComponent,
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