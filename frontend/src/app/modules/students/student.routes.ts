import { Routes } from '@angular/router';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';
import { StudentFormComponent } from './student-form/student-form.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Role } from '../../core/models/user.model';

export const studentRoutes: Routes = [
  { 
    path: '', 
    component: StudentListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  { 
    path: 'add', 
    component: StudentFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] }
  },
  { 
    path: 'edit/:id', 
    component: StudentFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] }
  },
  { 
    path: 'profile', 
    component: StudentDetailComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'formation/:formationId', 
    component: StudentListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  { 
    path: 'promo/:promo', 
    component: StudentListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  { 
    path: ':id', 
    component: StudentDetailComponent,
    canActivate: [authGuard]
  }
];

export default studentRoutes;
