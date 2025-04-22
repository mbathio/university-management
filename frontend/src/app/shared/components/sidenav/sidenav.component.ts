// src/app/shared/components/sidenav/sidenav.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Role, User } from '../../../core/models/user.model';

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
export class SidenavComponent implements OnInit {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard' },
    { 
      label: 'Administration', 
      icon: 'admin_panel_settings', 
      route: '/administration',
      roles: [Role.ADMIN, Role.ADMINISTRATION]
    },
    { label: 'Communications', icon: 'forum', route: '/communication' },
    { label: 'Formations', icon: 'school', route: '/formations' },
    { label: 'Étudiants', icon: 'people', route: '/students' },
    { 
      label: 'Insertion professionnelle', 
      icon: 'work', 
      route: '/insertion',
      roles: [Role.ADMIN, Role.FORMATION_MANAGER, Role.ADMINISTRATION]
    }
  ];
  
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  isAllowed(item: NavItem): boolean {
    if (!item.roles) {
      return true;
    }
    return this.authService.hasRole(item.roles);
  }
}