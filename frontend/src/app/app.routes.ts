// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import(
        './modules/administration/administration-dashboard/administration-dashboard.component'
      ).then((m) => m.AdministrationDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'administration',
    loadComponent: () =>
      import(
        './modules/administration/administration-dashboard/administration-dashboard.component'
      ).then((m) => m.AdministrationDashboardComponent),
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.ADMINISTRATION] },
  },
  {
    path: 'communication',
    loadComponent: () =>
      import(
        './modules/communication/document-list/document-list.component'
      ).then((m) => m.DocumentListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'formations',
    loadComponent: () =>
      import(
        './modules/formations/formation-list/formation-list.component'
      ).then((m) => m.FormationListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./modules/students/student-list/student-list.component').then(
        (m) => m.StudentListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'insertion',
    loadComponent: () =>
      import(
        './modules/insertion/insertion-list/insertion-list.component'
      ).then((m) => m.InsertionListComponent),
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
