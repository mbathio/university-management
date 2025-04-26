// src/app/modules/communication/communication.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {  } from './communication.routes';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { DocumentTypePipe } from './pipes/document-type.pipe';
import { VisibilityLevelPipe } from './pipes/visibility-level.pipe';
import { CommunicationDashboardComponent } from './dashboard/communication-dashboard.component';
import { AdminNotesComponent } from './admin-notes/admin-notes.component';
import { AdminNoteFormComponent } from './admin-form/admin-note-form.component';
import { CircularListComponent } from './circular-list/circular-list.component';
import { CircularFormComponent } from './circular-form/circular-form.component';

@NgModule({
  declarations: [
    // Si les composants ne sont pas autonomes (standalone: true)
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    
    // Importer les composants standalone
    DocumentListComponent,
    DocumentDetailComponent,
    ReportFormComponent,
    ReportListComponent,
    NotificationsComponent,
    DocumentTypePipe,
    VisibilityLevelPipe,
    CommunicationDashboardComponent,
    AdminNotesComponent,
    AdminNoteFormComponent,
    CircularListComponent,
    CircularFormComponent
  ]
})
export class CommunicationModule { }