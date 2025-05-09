// src/app/modules/communication/dashboard/communication-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';

import { DocumentService } from '../../../core/services/document.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Document, DocumentType } from '../../../core/models/document.model';
import { Notification } from '../models/notification.model';
import { DocumentTypePipe } from '../pipes/document-type.pipe';
import { NotificationsComponent } from '../notifications/notifications.component';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-communication-dashboard',
  templateUrl: './communication-dashboard.component.html',
  styleUrls: ['./communication-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    DocumentTypePipe,
    NotificationsComponent
  ]
})
export class CommunicationDashboardComponent implements OnInit {
  recentDocuments: Document[] = [];
  recentReports: Document[] = [];
  recentCirculars: Document[] = [];
  myDocuments: Document[] = [];
  unreadNotificationsCount = 0;
  loading = false;
  error = '';
  
  reportTypes = [
    DocumentType.MEETING_REPORT, 
    DocumentType.SEMINAR_REPORT, 
    DocumentType.WEBINAR_REPORT, 
    DocumentType.UNIVERSITY_COUNCIL
  ];
  
  adminTypes = [
    DocumentType.NOTE_SERVICE, 
    DocumentType.CIRCULAR, 
    DocumentType.ADMINISTRATIVE_NOTE
  ];

  constructor(
    private documentService: DocumentService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUnreadNotificationsCount();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.documentService.getAllDocuments().pipe(
      catchError((err) => {
        console.error('Detailed dashboard data loading error:', {
          message: err.message,
          status: err.status,
          url: err.url,
          errorObject: err
        });
        this.error = `Erreur de chargement (${err.status}): ${err.message || 'Serveur injoignable'}`;
        this.loading = false;
        return throwError(() => err);
      })
    ).subscribe({
      next: (documents) => {
        const sortedDocs = documents.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        this.recentDocuments = sortedDocs.slice(0, 5);
        
        this.recentReports = sortedDocs
          .filter(doc => this.reportTypes.includes(doc.type as DocumentType))
          .slice(0, 5);
        
        this.recentCirculars = sortedDocs
          .filter(doc => this.adminTypes.includes(doc.type as DocumentType))
          .slice(0, 5);
        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.myDocuments = sortedDocs
            .filter(doc => doc.createdBy?.id === currentUser.id)
            .slice(0, 5);
        }
        
        this.loading = false;
      }
    });
  }

  loadUnreadNotificationsCount(): void {
    this.notificationService.getUnreadCount().pipe(
      catchError((err) => {
        console.error('Detailed unread notifications loading error:', {
          message: err.message,
          status: err.status,
          url: err.url,
          errorObject: err
        });
        this.unreadNotificationsCount = 0;
        return throwError(() => err);
      })
    ).subscribe({
      next: (count) => {
        this.unreadNotificationsCount = count;
      }
    });
  }

  getDocumentIcon(document: Document): string {
    switch (document.type) {
      case DocumentType.MEETING_REPORT:
        return 'groups';
      case DocumentType.SEMINAR_REPORT:
      case DocumentType.WEBINAR_REPORT:
        return 'event';
      case DocumentType.UNIVERSITY_COUNCIL:
        return 'school';
      case DocumentType.NOTE_SERVICE:
      case DocumentType.ADMINISTRATIVE_NOTE:
        return 'note';
      case DocumentType.CIRCULAR:
        return 'announcement';
      default:
        return 'description';
    }
  }

  canManageAdminDocuments(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser !== null && 
      (currentUser.role.includes('ADMIN') || currentUser.role.includes('MANAGER'));
  }
}