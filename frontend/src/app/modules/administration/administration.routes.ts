import { Routes } from '@angular/router';
import { AdministrationDashboardComponent } from './administration-dashboard/administration-dashboard.component';
import { DocumentManagementComponent } from './document-management/document-management.component';
import { DocumentFormComponent } from './document-management/document-form/document-form.component';

export const administrationRoutes: Routes = [
  {
    path: '',
    component: AdministrationDashboardComponent,
  },
  {
    path: 'documents',
    component: DocumentManagementComponent,
  },
  {
    path: 'documents/add',
    component: DocumentFormComponent,
  },
  {
    path: 'documents/edit/:id',
    component: DocumentFormComponent,
  },
];

export default administrationRoutes;
