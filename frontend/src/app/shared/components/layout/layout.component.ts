// src/app/shared/components/layout/layout.component.ts
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { AuthService } from '../../../core/auth/auth.service';
import { NavItem } from '../sidenav/sidenav.component';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    HeaderComponent,
    SidenavComponent,
  ],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;
  navItems: NavItem[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    this.setupNavItems();
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  closeSidenav(): void {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  private setupNavItems(): void {
    this.navItems = [
      {
        label: 'Tableau de bord',
        icon: 'dashboard',
        route: '/dashboard',
      },
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        route: '/administration',
        roles: [Role.ADMIN, Role.ADMINISTRATION],
      },
      {
        label: 'Communications',
        icon: 'forum',
        route: '/communication',
      },
      {
        label: 'Formations',
        icon: 'school',
        route: '/formations',
      },
      {
        label: 'Étudiants',
        icon: 'people',
        route: '/students',
      },
      {
        label: 'Insertion professionnelle',
        icon: 'work',
        route: '/insertion',
        roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION],
      },
    ];
  }
}
