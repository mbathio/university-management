// 2. insertion.module.ts (correction)
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { InsertionRoutingModule } from './insertion.routes';
import { InsertionListComponent } from './insertion-list/insertion-list.component';
import { InsertionDetailComponent } from './insertion-detail/insertion-detail.component';
import { InsertionFormComponent } from './insertion-form/insertion-form.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { InsertionService } from './services/insertion.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatSnackBarModule,
    InsertionRoutingModule,
    StatisticsComponent,
    InsertionListComponent,
    InsertionDetailComponent,
    InsertionFormComponent,
  ],
})
export class InsertionModule {}
