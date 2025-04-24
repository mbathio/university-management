// src/app/modules/formations/formations.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { FormationListComponent } from './formation-list/formation-list.component';
import { FormationDetailComponent } from './formation-detail/formation-detail.component';
import { FormationFormComponent } from './formation-form/formation-form.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { TrainerListComponent } from './trainer-list/trainer-list.component';

const routes: Routes = [
  { path: '', component: FormationListComponent },
  { path: 'add', component: FormationFormComponent },
  { path: 'edit/:id', component: FormationFormComponent },
  { path: ':id', component: FormationDetailComponent },
  { path: ':id/schedule', component: ScheduleComponent },
  { path: ':id/trainers', component: TrainerListComponent },
  {
    path: 'my-formation',
    component: FormationDetailComponent,
    data: { myFormation: true },
  },
];

@NgModule({
  declarations: [],

  imports: [
    FormationListComponent,
    FormationListComponent,
    FormationDetailComponent,
    FormationFormComponent,
    TrainerListComponent,
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ReactiveFormsModule,
    FormationFormComponent,
    TrainerListComponent,
    FormationDetailComponent,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTabsModule,
  ],
})
export class FormationsModule {}
