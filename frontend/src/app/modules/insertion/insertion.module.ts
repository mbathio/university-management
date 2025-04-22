import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { InsertionDetailComponent } from './insertion-detail/insertion-detail.component';
import { InsertionFormComponent } from './insertion-form/insertion-form.component';
import { InsertionListComponent } from './insertion-list/insertion-list.component';

@NgModule({
  declarations: [
    InsertionDetailComponent,
    InsertionFormComponent,
    InsertionListComponent,
      ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    // Angular Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  exports: [
    InsertionDetailComponent,
    InsertionFormComponent,
    InsertionListComponent,
    
  ]
})
export class InsertionModule { }