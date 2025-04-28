// Le template fait référence à router mais il n'est pas injecté
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../../communication/services/notification.service';
import { Role } from '../../../core/models/role.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, of } from 'rxjs';

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
  styleUrls: ['./administration-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatIconModule, 
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
})
export class AdministrationDashboardComponent implements OnInit {
  adminSections: AdminSection[] = [
    {
      title: 'Gestion Documentaire',
      description: 'Courriers, notes de service, circulaires',
      icon: 'description',
      route: '/administration/documents',
      color: '#4CAF50',
    },
    {
      title: 'Gestion Budgétaire',
      description: 'Projet de budget, budget réalisé',
      icon: 'account_balance',
      route: '/administration/budget',
      color: '#2196F3',
      roles: [Role.ADMIN, Role.ADMINISTRATION],
    },
    {
      title: 'Ressources Humaines',
      description: 'Personnel administratif et enseignant',
      icon: 'people',
      route: '/administration/hr',
      color: '#FF9800',
      roles: [Role.ADMIN, Role.ADMINISTRATION],
    },
  ];
  hasRestrictedSections = false;
  unreadNotificationsCount = 0;
  documentCount = 0;
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private documentService: DocumentService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    // Parallel requests for documents and notifications
    this.documentService.getAllDocuments().pipe(
      catchError((err) => {
        this.handleError('Impossible de charger les documents', err);
        return of([]);
      })
    ).subscribe(documents => {
      this.documentCount = documents.length;
    });

    this.notificationService.getUnreadCount().pipe(
      catchError((err) => {
        this.handleError('Impossible de charger les notifications', err);
        return of(0);
      })
    ).subscribe(count => {
      this.unreadNotificationsCount = count;
      this.loading = false;
    });
  }

  private handleError(message: string, err: any): void {
    this.error = message;
    this.loading = false;
    this.snackBar.open(message, 'Fermer', { duration: 5000 });
    console.error(message, err);
  }

  isAllowed(section: AdminSection): boolean {
    if (!section.roles) {
      return true;
    }
    return this.authService.hasRole(section.roles);
  }
}
