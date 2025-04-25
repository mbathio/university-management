// src/app/modules/communication/communication.routes.ts
import { Routes } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { DocumentFormComponent } from './document-form/document-form.component';

const routes: Routes = [
  {
    path: '',
    component: ReportListComponent,
  },
  {
    path: 'reports/add',
    component: DocumentFormComponent,
  },
  {
    path: 'reports/edit/:id',
    component: DocumentFormComponent,
  },
  {
    path: 'report-list',
    component: ReportListComponent,
  },
  {
    path: 'report-list/add',
    component: DocumentFormComponent,
  },
  {
    path: 'detail/:id',
    // Assuming there's a document detail component
    // Replace this with the actual component if it exists
    component: ReportListComponent,
  },
];

export default routes;
