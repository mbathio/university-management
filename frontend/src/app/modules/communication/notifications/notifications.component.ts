// src/app/modules/communication/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  error: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getUserNotifications().subscribe({
      next: (notifications: Notification[]): void => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (err: unknown): void => {
        this.error = 'Erreur lors du chargement des notifications';
        this.loading = false;
        console.error('Error loading notifications:', err);
      },
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: (): void => {
        // Update local notification
        const notification: Notification | undefined = this.notifications.find(
          (n: Notification): boolean => n.id === id,
        );
        if (notification) {
          notification.read = true;
        }
      },
      error: (err: unknown): void => {
        console.error('Error marking notification as read:', err);
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: (): void => {
        // Update all local notifications
        this.notifications.forEach((n: Notification): void => {
          n.read = true;
        });
      },
      error: (err: unknown): void => {
        console.error('Error marking all notifications as read:', err);
      },
    });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe({
      next: (): void => {
        // Remove notification from local array
        this.notifications = this.notifications.filter(
          (n: Notification) => n.id !== id,
        );
      },
      error: (err: unknown): void => {
        console.error('Error deleting notification:', err);
      },
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT_ADDED':
        return 'description';
      case 'ACCOUNT_UPDATE':
        return 'person';
      case 'SYSTEM':
        return 'notifications';
      case 'MEETING':
        return 'event';
      default:
        return 'notifications';
    }
  }

  isMarkAllAsReadDisabled(): boolean {
    return this.notifications.length === 0 || this.notifications.every(n => n.read);
  }

  getNotificationRoute(notification: Notification): string[] {
    // Define routes based on notification type and reference
    if (notification.type === 'DOCUMENT_ADDED' && notification.referenceId) {
      return ['/communication/detail', notification.referenceId.toString()];
    } else if (notification.type === 'MEETING' && notification.referenceId) {
      return ['/communication/meetings', notification.referenceId.toString()];
    } else {
      return ['/communication'];
    }
  }
}
