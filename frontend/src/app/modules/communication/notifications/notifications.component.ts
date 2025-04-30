// src/app/modules/communication/notifications/notifications.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EMPTY, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../services/notification.service';
import { Notification, NotificationType } from '../models/notification.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatButtonToggleModule
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  totalNotifications = 0;
  totalPages = 0;
  pageSize = 10;
  currentPage = 0;

  // Filtering
  currentFilter: 'ALL' | 'UNREAD' | 'ARCHIVED' = 'ALL';
  currentPriority?: 'LOW' | 'MEDIUM' | 'HIGH';

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;

    this.notificationService.getNotifications(
      this.currentPage, 
      this.pageSize, 
      this.currentFilter,
      this.currentPriority
    )
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.handleError(error);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.notifications = response.content || [];
          this.applyAdvancedFilter();
          this.totalNotifications = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        }
      });
  }

  filterNotifications(
    filter: 'ALL' | 'UNREAD' | 'ARCHIVED' = 'ALL', 
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  ): void {
    this.currentFilter = filter;
    this.currentPriority = priority;
    this.loadNotifications();
  }

  applyAdvancedFilter(): void {
    if (this.currentFilter === 'ALL') {
      this.filteredNotifications = this.notifications;
    } else {
      this.filteredNotifications = this.notifications.filter(
        notification => notification.status === this.currentFilter
      );
    }

    if (this.currentPriority) {
      this.filteredNotifications = this.filteredNotifications.filter(
        notification => notification.priority === this.currentPriority
      );
    }
  }

  retryLoadNotifications(): void {
    this.error = null;
    this.loadNotifications();
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Notification error:', error);
    
    let errorMessage = 'Une erreur inattendue est survenue';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Vous devez vous connecter pour voir les notifications';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas la permission de voir les notifications';
          break;
        case 404:
          errorMessage = 'Les notifications n\'ont pas pu être chargées';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
      }
    }

    this.error = errorMessage;
    this.loading = false;
    this.showErrorSnackBar(this.error);
  }

  markAsRead(notification: Notification): void {
    this.notificationService.updateNotificationStatus(notification.id, 'READ')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedNotification) => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.notifications[index] = updatedNotification;
            this.applyAdvancedFilter();
          }
        },
        error: (err) => {
          this.showErrorSnackBar('Impossible de marquer la notification comme lue');
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
          this.showSuccessSnackBar('Toutes les notifications ont été marquées comme lues');
        },
        error: (err) => {
          this.showErrorSnackBar('Impossible de marquer toutes les notifications comme lues');
        }
      });
  }

  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }

  getNotificationIcon(notification: Notification): string {
    switch (notification.type) {
      case NotificationType.DOCUMENT_ADDED:
        return 'description';
      case NotificationType.ADMIN_NOTE:
        return 'sticky_note_2';
      case NotificationType.CIRCULAR:
        return 'note';
      default:
        return 'notifications';
    }
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.filteredNotifications = this.filteredNotifications.filter(n => n.id !== notification.id);
        },
        error: (err) => {
          console.error('Delete notification error:', err);
        }
      });
  }
}
