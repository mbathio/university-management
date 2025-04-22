// src/app/modules/communication/communication.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';

// Components
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportFormComponent } from './report-form/report-form.component';

const routes: Routes = [
  { path: '', component: DocumentListComponent },
  { path: 'add', component: DocumentFormComponent },
  { path: 'edit/:id', component: DocumentFormComponent },
  { path: ':id', component: DocumentDetailComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'reports', component: ReportListComponent },
  { path: 'reports/add', component: ReportFormComponent },
  { path: 'reports/edit/:id', component: ReportFormComponent }
];

@NgModule({
  declarations: [
    DocumentListComponent,
    DocumentDetailComponent,
    DocumentFormComponent,
    NotificationsComponent,
    ReportListComponent,
    ReportFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatTabsModule
  ]
})
export class CommunicationModule { }