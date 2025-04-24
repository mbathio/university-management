// 1. insertion-routing.module.ts (à créer)
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsertionListComponent } from './insertion-list/insertion-list.component';
import { InsertionDetailComponent } from './insertion-detail/insertion-detail.component';
import { InsertionFormComponent } from './insertion-form/insertion-form.component';
import { StatisticsComponent } from './statistics/statistics.component';

const routes: Routes = [
  { path: '', component: InsertionListComponent },
  { path: 'add', component: InsertionFormComponent },
  { path: 'edit/:id', component: InsertionFormComponent },
  { path: ':id', component: InsertionDetailComponent },
  { path: 'statistics', component: StatisticsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsertionRoutingModule {}
