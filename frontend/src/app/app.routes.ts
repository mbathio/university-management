// src/app/app.routes.ts - updated version
import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/models/user.model';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then((mod) => mod.default),
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
