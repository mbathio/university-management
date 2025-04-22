// src/app/shared/components/sidenav/sidenav.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: Role[];
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Output() navItemClicked = new EventEmitter<void>();
  
  navItems: NavItem[] = [
    { 
      label: 'Tableau de bord', 
      icon: 'dashboard', 
      route: '/dashboard'
    },
    { 
      label: 'Étudiants', 
      icon: 'school', 
      route: '/students',
      roles: [Role.ADMIN, Role.TEACHER, Role.FORMATION_MANAGER, Role.TUTOR, Role.ADMINISTRATION]
    },
    { 
      label: 'Formations', 
      icon: 'book', 
      route: '/formations',
      roles: [Role.ADMIN, Role.TEACHER, Role.FORMATION_MANAGER, Role.STUDENT]
    },
    { 
      label: 'Documents', 
      icon: 'description', 
      route: '/documents'
    },
    { 
      label: 'Administration', 
      icon: 'admin_panel_settings', 
      route: '/administration',
      roles: [Role.ADMIN, Role.ADMINISTRATION]
    },
    { 
      label: 'Insertion Pro', 
      icon: 'work', 
      route: '/insertion',
      roles: [Role.ADMIN, Role.FORMATION_MANAGER]
    }
  ];
  
  constructor(private authService: AuthService) {}
  
  handleNavItemClick(): void {
    this.navItemClicked.emit();
  }
  
  isAllowed(item: NavItem): boolean {
    // Si aucun rôle n'est spécifié, l'élément est visible pour tous
    if (!item.roles) {
      return true;
    }
    
    // Sinon, vérifiez si l'utilisateur a un des rôles requis
    return this.authService.hasRole(item.roles);
  }
}