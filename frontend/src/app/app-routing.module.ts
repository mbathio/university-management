// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { Role } from './core/models/user.model';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent
      },
      {
        path: 'students',
        loadChildren: () => import('./modules/students/students.module').then(m => m.StudentsModule),
        data: { roles: [Role.ADMIN, Role.TEACHER, Role.FORMATION_MANAGER] }
      },
      {
        path: 'formations',
        loadChildren: () => import('./modules/formations/formations.module').then(m => m.FormationsModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('./modules/communication/communication.module').then(m => m.CommunicationModule)
      },
      {
        path: 'administration',
        loadChildren: () => import('./modules/administration/administration.module').then(m => m.AdministrationModule),
        data: { roles: [Role.ADMIN, Role.ADMINISTRATION] }
      },
      {
        path: 'insertion',
        loadChildren: () => import('./modules/insertion/insertion.module').then(m => m.InsertionModule),
        data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }