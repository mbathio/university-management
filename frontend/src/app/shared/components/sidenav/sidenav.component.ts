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
      roles: [Role.ADMIN, Role.TEACHER, Role.