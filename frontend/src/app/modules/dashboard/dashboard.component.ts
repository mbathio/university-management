import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { User } from '../../core/models/user.model';

enum DashboardCardType {
  ACADEMIC_PROGRESS = 'ACADEMIC_PROGRESS',
  DOCUMENT_MANAGEMENT = 'DOCUMENT_MANAGEMENT',
  PERSONAL_INFO = 'PERSONAL_INFO',
  NOTIFICATIONS = 'NOTIFICATIONS'
}

interface DashboardCard {
  id: string;
  title: string;
  type: DashboardCardType;
  icon: string;
  route: string;
  color: string;
  description: string;
  data?: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  dashboardCards: DashboardCard[] = [];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadDashboardCards(user);
      }
    });
  }

  private loadDashboardCards(user: User) {
    switch (user.role) {
      case 'STUDENT':
        this.dashboardCards = this.getStudentDashboardCards(user);
        break;
      case 'TEACHER':
        this.dashboardCards = this.getTeacherDashboardCards(user);
        break;
      case 'ADMIN':
        this.dashboardCards = this.getAdminDashboardCards(user);
        break;
      default:
        this.dashboardCards = this.getDefaultDashboardCards(user);
    }
  }

  private getStudentDashboardCards(user: User): DashboardCard[] {
    return [
      {
        id: 'academic_progress',
        title: 'Progression Académique',
        type: DashboardCardType.ACADEMIC_PROGRESS,
        icon: 'school',
        route: '/academic-progress',
        color: '#3498db',
        description: 'Suivez votre progression académique',
        data: this.dashboardService.getAcademicProgress(user.id.toString())
      },
      {
        id: 'documents',
        title: 'Mes Documents',
        type: DashboardCardType.DOCUMENT_MANAGEMENT,
        icon: 'description',
        route: '/documents',
        color: '#2ecc71',
        description: 'Gérez vos documents administratifs',
        data: this.dashboardService.getUserDocuments(user.id.toString())
      }
    ];
  }

  private getTeacherDashboardCards(user: User): DashboardCard[] {
    return [
      {
        id: 'class_management',
        title: 'Gestion des Classes',
        type: DashboardCardType.ACADEMIC_PROGRESS,
        icon: 'group',
        route: '/class-management',
        color: '#e74c3c',
        description: 'Gérez vos classes',
        data: this.dashboardService.getClassManagement(user.id.toString())
      },
      {
        id: 'research_docs',
        title: 'Documents de Recherche',
        type: DashboardCardType.DOCUMENT_MANAGEMENT,
        icon: 'library_books',
        route: '/research-docs',
        color: '#f39c12',
        description: 'Gérez vos documents de recherche',
        data: this.dashboardService.getResearchDocuments(user.id.toString())
      }
    ];
  }

  private getAdminDashboardCards(user: User): DashboardCard[] {
    return [
      {
        id: 'system_overview',
        title: 'Vue Système',
        type: DashboardCardType.ACADEMIC_PROGRESS,
        icon: 'dashboard',
        route: '/system-overview',
        color: '#9b59b6',
        description: 'Vue d\'ensemble du système',
        data: this.dashboardService.getSystemOverview()
      },
      {
        id: 'notifications',
        title: 'Notifications',
        type: DashboardCardType.NOTIFICATIONS,
        icon: 'notifications',
        route: '/notifications',
        color: '#f1c40f',
        description: 'Vos dernières notifications',
        data: this.dashboardService.getSystemNotifications()
      }
    ];
  }

  private getDefaultDashboardCards(user: User): DashboardCard[] {
    return [
      {
        id: 'personal_info',
        title: 'Informations Personnelles',
        type: DashboardCardType.PERSONAL_INFO,
        icon: 'person',
        route: '/profile',
        color: '#e74c3c',
        description: 'Consultez et mettez à jour vos informations',
        data: user
      }
    ];
  }
}