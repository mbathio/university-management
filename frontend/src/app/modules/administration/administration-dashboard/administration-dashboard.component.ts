// src/app/modules/administration/administration-dashboard/administration-dashboard.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

interface AdminSection {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  roles?: Role[];
}

@Component({
  selector: 'app-administration-dashboard',
  templateUrl: './administration-dashboard.component.html',
  styleUrls: ['./administration-dashboard.component.scss']
})
export class AdministrationDashboardComponent {
  adminSections: AdminSection[] = [
    {
      title: 'Gestion Documentaire',
      description: 'Courriers, notes de service, circulaires',
      icon: 'description',
      route: '/administration/documents',
      color: '#4CAF50'
    },
    {
      title: 'Gestion Budgétaire',
      description: 'Projet de budget, budget réalisé',
      icon: 'account_balance',
      route: '/administration/budget',
      color: '#2196F3',
      roles: [Role.ADMIN, Role.ADMINISTRATION]
    },
    {
      title: 'Ressources Humaines',
      description: 'Personnel administratif et enseignant',
      icon: 'people',
      route: '/administration/hr',
      color: '#FF9800',
      roles: [Role.ADMIN, Role.ADMINISTRATION]
    }
  ];
  
  constructor(
    private authService: AuthService,
    private router: Router // Ajouter cette injection
  ) {}  
  isAllowed(section: AdminSection): boolean {
    if (!section.roles) {
      return true;
    }
    return this.authService.hasRole(section.roles);
  }
}