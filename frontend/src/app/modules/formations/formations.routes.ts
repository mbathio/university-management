// src/app/modules/formations/formations.routes.ts
import { Routes } from '@angular/router';
import { FormationListComponent } from './formation-list/formation-list.component';
import { FormationDetailComponent } from './formation-detail/formation-detail.component';
import { FormationFormComponent } from './formation-form/formation-form.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { TrainerListComponent } from './trainer-list/trainer-list.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Role } from '../../core/models/user.model'; // Correction de l'import de Role pour être cohérent

export default [
  {
    path: '',
    component: FormationListComponent,
  },
  {
    path: 'add',
    component: FormationFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] },
  },
  {
    path: 'edit/:id',
    component: FormationFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] },
  },
  {
    path: ':id',
    component: FormationDetailComponent,
  },
  {
    path: ':id/schedule',
    component: ScheduleComponent,
  },
  {
    path: ':id/trainers',
    component: TrainerListComponent,
  },
  {
    path: 'my-formation',
    component: FormationDetailComponent,
    data: { myFormation: true },
  },
] as Routes;