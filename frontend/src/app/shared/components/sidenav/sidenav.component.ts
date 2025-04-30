// src/app/shared/components/sidenav/sidenav.component.ts
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';
import { User } from '../../../core/models/user.model'; // Assuming User model is defined here

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  requiredRoles?: Role[];
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
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si aucun élément de navigation n'est fourni, nous pouvons initialiser des valeurs par défaut
    if (this.navItems.length === 0) {
      this.setupDefaultNavItems();
    }

    // Subscribe to current user changes
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigateTo(route: string): void {
    // Emit navigation event
    this.navItemClicked.emit();
    
    // Navigate to the specified route
    this.router.navigate([route]);
  }

  isAllowed(item: NavItem): boolean {
    if (!item.requiredRoles) return true;
    return this.authService.hasRole(item.requiredRoles);
  }

  private setupDefaultNavItems(): void {
    const userRole = this.currentUser?.role;

    const baseNavItems: NavItem[] = [
      {
        label: 'Tableau de Bord',
        icon: 'dashboard',
        route: '/dashboard'
      }
    ];

    const studentNavItems: NavItem[] = [
      {
        label: 'Liste des Étudiants',
        icon: 'people',
        route: '/students'
      },
      {
        label: 'Ajouter un Étudiant',
        icon: 'person_add',
        route: '/students/new',
        requiredRoles: [Role.ADMIN, Role.FORMATION_MANAGER]
      }
    ];

    const formationNavItems: NavItem[] = [
      {
        label: 'Liste des Formations',
        icon: 'school',
        route: '/formations'
      },
      {
        label: 'Ajouter une Formation',
        icon: 'add_circle',
        route: '/formations/add',
        requiredRoles: [Role.ADMIN, Role.FORMATION_MANAGER]
      }
    ];

    const adminNavItems: NavItem[] = [
      {
        label: 'Administration',
        icon: 'admin_panel_settings',
        route: '/admin',
        requiredRoles: [Role.ADMIN]
      }
    ];

    // Combine and filter nav items based on user role
    this.navItems = [
      ...baseNavItems,
      ...studentNavItems,
      ...formationNavItems,
      ...(userRole === Role.ADMIN ? adminNavItems : [])
    ].filter(item => 
      !item.requiredRoles || 
      this.authService.hasRole(item.requiredRoles)
    );
  }
}
