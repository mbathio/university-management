// src/app/modules/communication/communication.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { Role } from '../../core/models/user.model';

import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CommunicationDashboardComponent } from './dashboard/communication-dashboard.component';
import { AdminNotesComponent } from './admin-notes/admin-notes.component';
import { AdminNoteFormComponent } from './admin-form/admin-note-form.component';
import { CircularListComponent } from './circular-list/circular-list.component';
import { CircularFormComponent } from './circular-form/circular-form.component';

const routes: Routes = [
  {
    path: '',
    component: CommunicationDashboardComponent,
  },
  {
    path: 'documents',
    component: DocumentListComponent,
  },
  {
    path: 'detail/:id',
    component: DocumentDetailComponent,
  },
  {
    path: 'reports',
    component: ReportListComponent,
  },
  {
    path: 'reports/add',
    component: ReportFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reports/edit/:id',
    component: ReportFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin-notes',
    component: AdminNotesComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] },
  },
  {
    path: 'admin-notes/add',
    component: AdminNoteFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION] },
  },
  {
    path: 'admin-notes/edit/:id',
    component: AdminNoteFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'circulars',
    component: CircularListComponent,
  },
  {
    path: 'circulars/add',
    component: CircularFormComponent,
    canActivate: [authGuard],
    data: { roles: [Role.ADMIN, Role.ADMINISTRATION] },
  },
  {
    path: 'circulars/edit/:id',
    component: CircularFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
  },
];

export default routes;