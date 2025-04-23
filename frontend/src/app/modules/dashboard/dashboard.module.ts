// src/app/modules/dashboard/dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Standalone Components
import { DashboardComponent } from './dashboard.component';

import { dashboardRoutes } from './dashboard.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),

    // Standalone Components
    DashboardComponent,

    // Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
})
export class DashboardModule {}
