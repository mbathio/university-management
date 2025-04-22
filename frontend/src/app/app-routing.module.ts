// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { Role } from './core/models/user.model';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'administration',
    loadChildren: () => import('./modules/administration/administration.module').then(m => m.AdministrationModule),
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN, Role.ADMINISTRATION] }
  },
  {
    path: 'communication',
    loadChildren: () => import('./modules/communication/communication.module').then(m => m.CommunicationModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'formations',
    loadChildren: () => import('./modules/formations/formations.module').then(m => m.FormationsModule),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'students',
    loadChildren: () => import('./modules/students/students.module').then(m => m.StudentsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'insertion',
    loadChildren: () => import('./modules/insertion/insertion.module').then(m => m.InsertionModule),
    canActivate: [AuthGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }