import { Routes } from '@angular/router';
import { TransactionsComponent } from './transactions.component';
import { CreateComponent } from './CreateTransaction/create.component';
import { authGuard } from '../components/layout/auth.guard';

export const transactionsRoutes: Routes = [
  {
    path: '',
    component: TransactionsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create',
    component: CreateComponent,
    canActivate: [authGuard]
  },
];
