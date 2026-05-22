import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./Login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
     {
          path: 'home',
          loadComponent: () => import('./Home/home.page').then((m) => m.HomePage),
     },
     {
          path: 'cost-centers',
          loadChildren: () => import('./CostCenters/costcenters.routes').then(m => m.costcentersRoutes)
     },
     {
          path: 'currencies',
          loadChildren: () => import('./Currencies/currencies.routes').then(m => m.currenciesRoutes)
     },
     {
          path: 'users',
          loadChildren: () => import('./Users/users.routes').then(m => m.usersRoutes)
     },
     {
          path: 'payment-methods',
          loadChildren: () => import('./PaymentMethods/paymentmethods.routes').then(m => m.paymentMethodsRoutes)
     },
     {
          path: 'events',
          loadChildren: () => import('./Events/events.routes').then(m => m.eventsRoutes)
     }

      // Agregar más rutas aquí que requieran Navbar y Sidebar
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
