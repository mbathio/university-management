// src/app/modules/communication/communication.routes.ts
import { Routes } from '@angular/router';
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
  { path: 'detail/:id', component: DocumentDetailComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'reports', component: ReportListComponent },
  { path: 'reports/add', component: ReportFormComponent },
  { path: 'reports/edit/:id', component: ReportFormComponent },
];

export default routes;
