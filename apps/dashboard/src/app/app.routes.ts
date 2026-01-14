import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'owner-dashboard',
    loadComponent: () =>
      import('./components/dashboards/owner-dashboard').then((m) => m.OwnerDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./components/dashboards/admin-dashboard').then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'viewer-dashboard',
    loadComponent: () =>
      import('./components/dashboards/viewer-dashboard').then((m) => m.ViewerDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
