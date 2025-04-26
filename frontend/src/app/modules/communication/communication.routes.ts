// src/app/modules/communication/communication-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { ReportListComponent } from './report-list/report-list.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CommunicationDashboardComponent } from './dashboard/communication-dashboard.component';
import { AdminNotesComponent } from './admin-notes/admin-notes.component';
import { AdminNoteFormComponent } from './admin-notes/admin-note-form.component';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';

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
    canActivate: [AuthGuard],
  },
  {
    path: 'reports/edit/:id',
    component: ReportFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-notes',
    component: AdminNotesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: 'admin-notes/add',
    component: AdminNoteFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: 'admin-notes/edit/:id',
    component: AdminNoteFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] },
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunicationRoutingModule {}
