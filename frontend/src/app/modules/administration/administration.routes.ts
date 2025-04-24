import { Routes } from '@angular/router';
import { Role } from '../../core/models/user.model';

const administrationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './administration-dashboard/administration-dashboard.component'
      ).then((m) => m.AdministrationDashboardComponent),
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./document-management/document-management.component').then(
        (m) => m.DocumentManagementComponent,
      ),
  },
  {
    path: 'documents/add',
    loadComponent: () =>
      import(
        './document-management/document-form/document-form.component'
      ).then((m) => m.DocumentFormComponent),
  },
  {
    path: 'documents/edit/:id',
    loadComponent: () =>
      import(
        './document-management/document-form/document-form.component'
      ).then((m) => m.DocumentFormComponent),
  },
  {
    path: 'budget',
    loadComponent: () =>
      import(
        './administration-dashboard/administration-dashboard.component'
      ).then((m) => m.AdministrationDashboardComponent),
    data: { roles: [Role.ADMIN, Role.ADMINISTRATION] },
  },
  {
    path: 'hr',
    loadComponent: () =>
      import(
        './administration-dashboard/administration-dashboard.component'
      ).then((m) => m.AdministrationDashboardComponent),
    data: { roles: [Role.ADMIN, Role.ADMINISTRATION] },
  },
];

export default administrationRoutes;
