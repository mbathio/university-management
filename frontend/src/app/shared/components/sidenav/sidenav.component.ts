// src/app/shared/components/sidenav/sidenav.component.ts
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
})
export class SidenavComponent implements OnInit {
  @Output() navItemClicked = new EventEmitter<void>();
  @Input() navItems: NavItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Si aucun élément de navigation n'est fourni, nous pouvons initialiser des valeurs par défaut
    if (this.navItems.length === 0) {
      this.setupDefaultNavItems();
    }
  }

  navigateTo(route: string): void {
    this.navItemClicked.emit();
  }

  isAllowed(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.authService.hasRole(item.roles);
  }

  private setupDefaultNavItems(): void {
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
