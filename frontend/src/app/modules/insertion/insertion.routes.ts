// 1. insertion-routing.module.ts (à créer)
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsertionListComponent } from './insertion-list/insertion-list.component';
import { InsertionDetailComponent } from './insertion-detail/insertion-detail.component';
import { InsertionFormComponent } from './insertion-form/insertion-form.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Role } from '../../core/models/user.model';

const routes: Routes = [
  { 
    path: '', 
    component: InsertionListComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  { 
    path: 'add', 
    component: InsertionFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] }
  },
  { 
    path: 'edit/:id', 
    component: InsertionFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER] }
  },
  { 
    path: 'statistics', 
    component: StatisticsComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] }
  },
  { 
    path: ':id', 
    component: InsertionDetailComponent,
    canActivate: [authGuard]
  }
];

export { routes };

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsertionRoutingModule {}
