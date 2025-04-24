// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
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
    loadChildren: () =>
      import('./modules/administration/administration.routes').then(
        (mod) => mod.default,
      ),
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
    loadChildren: () =>
      import('./modules/formations/formations.routes').then(
        (mod) => mod.default,
      ),
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
  // Dans app.routes.ts
  {
    path: 'insertion',
    loadChildren: () =>
      import('./modules/insertion/insertion.module').then(
        (m) => m.InsertionModule,
      ),
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
