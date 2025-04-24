// src/app/modules/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { User, Role } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  // Cards to display on dashboard based on role
  dashboardCards: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.initializeDashboardCards();
  }

  initializeDashboardCards(): void {
    // Base cards for all users
    this.dashboardCards = [
      {
        title: 'Documents',
        description: 'Accéder aux documents et annonces',
        icon: 'description',
        route: '/communication',
        color: '#4CAF50',
      },
    ];

    // Add role-specific cards
    if (this.currentUser) {
      switch (this.currentUser.role) {
        case Role.ADMIN:
          this.addAdminCards();
          break;
        case Role.TEACHER:
          this.addTeacherCards();
          break;
        case Role.STUDENT:
          this.addStudentCards();
          break;
        case Role.FORMATION_MANAGER:
          this.addFormationManagerCards();
          break;
        case Role.ADMINISTRATION:
          this.addAdministrationCards();
          break;
        case Role.STAFF:
          this.addTutorCards();
          break;
      }
    }
  }

  addAdminCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Administration',
        description: 'Gérer les utilisateurs et les accès',
        icon: 'admin_panel_settings',
        route: '/administration',
        color: '#F44336',
      },
      {
        title: 'Étudiants',
        description: 'Consulter et gérer les étudiants',
        icon: 'school',
        route: '/students',
        color: '#2196F3',
      },
      {
        title: 'Formations',
        description: 'Gérer les formations et cursus',
        icon: 'book',
        route: '/formations',
        color: '#FF9800',
      },
      {
        title: 'Insertion Pro',
        description: "Suivre l'insertion professionnelle",
        icon: 'work',
        route: '/insertion',
        color: '#9C27B0',
      },
    ];
  }

  addTeacherCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Étudiants',
        description: 'Consulter la liste des étudiants',
        icon: 'school',
        route: '/students',
        color: '#2196F3',
      },
      {
        title: 'Formations',
        description: 'Consulter les formations',
        icon: 'book',
        route: '/formations',
        color: '#FF9800',
      },
    ];
  }

  addStudentCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Ma Formation',
        description: 'Consulter les détails de ma formation',
        icon: 'book',
        route: '/formations/my-formation',
        color: '#FF9800',
      },
      {
        title: 'Mon Profil',
        description: 'Consulter et mettre à jour mon profil',
        icon: 'person',
        route: '/students/profile',
        color: '#2196F3',
      },
    ];
  }

  addFormationManagerCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Formations',
        description: 'Gérer les formations et cursus',
        icon: 'book',
        route: '/formations',
        color: '#FF9800',
      },
      {
        title: 'Étudiants',
        description: 'Gérer les étudiants inscrits',
        icon: 'school',
        route: '/students',
        color: '#2196F3',
      },
      {
        title: 'Insertion Pro',
        description: "Suivre l'insertion professionnelle",
        icon: 'work',
        route: '/insertion',
        color: '#9C27B0',
      },
    ];
  }

  addAdministrationCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Administration',
        description: 'Accéder aux fonctions administratives',
        icon: 'admin_panel_settings',
        route: '/administration',
        color: '#F44336',
      },
      {
        title: 'Étudiants',
        description: 'Consulter la liste des étudiants',
        icon: 'school',
        route: '/students',
        color: '#2196F3',
      },
    ];
  }

  addTutorCards(): void {
    this.dashboardCards = [
      ...this.dashboardCards,
      {
        title: 'Étudiants',
        description: 'Consulter mes étudiants suivis',
        icon: 'school',
        route: '/students',
        color: '#2196F3',
      },
    ];
  }
}
