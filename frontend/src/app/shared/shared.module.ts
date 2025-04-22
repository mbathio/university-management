// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { HeaderComponent } from './components/header/header.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    HeaderComponent,
    SidenavComponent,
    LayoutComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    
    // Material Modules
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule
  ],
  exports: [
    HeaderComponent,
    SidenavComponent,
    LayoutComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule { }