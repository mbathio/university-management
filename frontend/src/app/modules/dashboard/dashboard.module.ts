// src/app/modules/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { dashboardRoutes } from './dashboard.routes';

@NgModule({
  imports: [RouterModule.forChild(dashboardRoutes), DashboardComponent],
  exports: [RouterModule],
})
export class DashboardModule {}
