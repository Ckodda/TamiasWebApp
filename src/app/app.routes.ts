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
          path: 'currencies',
          loadChildren: () => import('./Currencies/currencies.routes').then(m => m.currenciesRoutes)
     },
     {
          path: 'users',
          loadChildren: () => import('./Users/users.routes').then(m => m.usersRoutes)
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
