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

import { InsertionRoutingModule } from './insertion-routing.module';
import { InsertionListComponent } from './insertion-list/insertion-list.component';
import { InsertionDetailComponent } from './insertion-detail/insertion-detail.component';
import { InsertionFormComponent } from './insertion-form/insertion-form.component';
import { InsertionService } from './services/insertion.service';

@NgModule({
  declarations: [
    InsertionListComponent,
    InsertionDetailComponent,
    InsertionFormComponent,
  ],
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
    InsertionRoutingModule,
  ],
  providers: [InsertionService],
})
export class InsertionModule {}
