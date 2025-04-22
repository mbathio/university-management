// src/app/modules/administration/administration.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatTabsModule } from '@angular/material/tabs';
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

// Components
import { DocumentManagementComponent } from './document-management/document-management.component';
import { BudgetManagementComponent } from './budget-management/budget-management.component';
import { HrManagementComponent } from './hr-management/hr-management.component';
import { AdministrationDashboardComponent } from './administration-dashboard/administration-dashboard.component';
import { DocumentFormComponent } from './document-management/document-form/document-form.component';
import { BudgetFormComponent } from './budget-management/budget-form/budget-form.component';
import { EmployeeFormComponent } from './hr-management/employee-form/employee-form.component';

const routes: Routes = [
  { path: '', component: AdministrationDashboardComponent },
  { path: 'documents', component: DocumentManagementComponent },
  { path: 'documents/add', component: DocumentFormComponent },
  { path: 'documents/edit/:id', component: DocumentFormComponent },
  { path: 'budget', component: BudgetManagementComponent },
  { path: 'budget/add', component: BudgetFormComponent },
  { path: 'budget/edit/:id', component: BudgetFormComponent },
  { path: 'hr', component: HrManagementComponent },
  { path: 'hr/add', component: EmployeeFormComponent },
  { path: 'hr/edit/:id', component: EmployeeFormComponent }
];

@NgModule({
  declarations: [
    DocumentManagementComponent,
    BudgetManagementComponent,
    HrManagementComponent,
    AdministrationDashboardComponent,
    DocumentFormComponent,
    BudgetFormComponent,
    EmployeeFormComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    
    // Material Modules
    MatTabsModule,
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
    MatChipsModule
  ]
})
export class AdministrationModule { }