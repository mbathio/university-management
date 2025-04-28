// src/app/modules/communication/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';

@Component({
  selector: 'app-notifications',
  template: `
    <div class="notifications-container">
      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="30"></mat-spinner>
      </div>

      <mat-list *ngIf="!loading">
        <mat-list-item
          *ngFor="let notification of notifications"
          [class.unread]="!notification.read"
        >
          <mat-icon matListItemIcon>{{
            getNotificationIcon(notification.type)
          }}</mat-icon>
          <div matListItemTitle>{{ notification.title }}</div>
          <div matListItemLine>{{ notification.message }}</div>
          <div matListItemMeta>
            {{ notification.createdAt | date: 'short' }}
          </div>
          <button
            mat-icon-button
            (click)="markAsRead(notification.id)"
            *ngIf="!notification.read"
          >
            <mat-icon>done</mat-icon>
          </button>
        </mat-list-item>

        <mat-list-item *ngIf="notifications.length === 0">
          <div>Aucune notification</div>
        </mat-list-item>
      </mat-list>

      <div class="notification-actions" *ngIf="notifications.length > 0">
        <button mat-button color="primary" (click)="markAllAsRead()">
          Tout marquer comme lu
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        min-height: 100px;
      }
      .unread {
        background-color: rgba(0, 0, 0, 0.05);
      }
      .loading-spinner {
        display: flex;
        justify-content: center;
        padding: 20px;
      }
      .notification-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 10px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getRecentNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications', error);
        this.loading = false;
      },
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const notification = this.notifications.find((n) => n.id === id);
        if (notification) {
          notification.read = true;
        }
      },
      error: (error) =>
        console.error('Error marking notification as read', error),
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((notification) => {
          notification.read = true;
        });
      },
      error: (error) =>
        console.error('Error marking all notifications as read', error),
    });
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }
}
