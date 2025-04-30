// src/app/modules/formations/formations.routes.ts
import { Routes } from '@angular/router';
import { FormationListComponent } from './formation-list/formation-list.component';
import { FormationDetailComponent } from './formation-detail/formation-detail.component';
import { FormationFormComponent } from './formation-form/formation-form.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Role } from '../../core/models/role.model';

export const FORMATION_ROUTES: Routes = [
  {
    path: '',
    component: FormationListComponent,
    canActivate: [authGuard],
    data: { 
      roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.STUDENT]
    }
  },
  {
    path: 'add',
    component: FormationDetailComponent,
    canActivate: [authGuard],
    data: { 
      roles: [Role.ADMIN, Role.FORMATION_MANAGER],
      title: 'Ajouter une Formation',
      newFormation: true
    }
  },
  {
    path: ':id',
    component: FormationDetailComponent,
    canActivate: [authGuard],
    data: { 
      roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.STUDENT]
    }
  },
  {
    path: 'edit/:id',
    component: FormationFormComponent,
    canActivate: [authGuard],
    data: { 
      roles: [Role.ADMIN, Role.FORMATION_MANAGER],
      title: 'Modifier une Formation'
    }
  }
];

export default FORMATION_ROUTES;