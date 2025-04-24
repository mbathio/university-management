// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/models/user.model';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
];

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: authRoutes,
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
    path: 'documents',
    loadChildren: () =>
      import('./modules/communication/communication.routes').then(
        (mod) => mod.default,
      ),
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
    loadChildren: () =>
      // Changed to loadChildren for consistency
      import('./modules/students/student.routes').then((mod) => mod.default),
    canActivate: [authGuard],
  },
  {
    path: 'insertion',
    loadChildren: () =>
      import('./modules/insertion/insertion.routes').then((mod) => mod.routes),
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
