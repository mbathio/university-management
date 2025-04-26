// src/app/modules/communication/notification-alert/notification-alert.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-alert',
  templateUrl: './notification-alert.component.html',
  styleUrls: ['./notification-alert.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class NotificationAlertComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  recentNotifications: Notification[] = [];
  private pollSubscription: Subscription | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    
    // Vérifier les nouvelles notifications toutes les minutes
    this.pollSubscription = interval(60000).pipe(
      switchMap(() => this.notificationService.getUnreadCount())
    ).subscribe({
      next: (count) => {
        if (count !== this.unreadCount) {
          this.loadNotifications();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (notifications) => {
        this.recentNotifications = notifications
          .filter(n => !n.read)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.unreadCount = this.recentNotifications.length;
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT_ADDED':
        return 'description';
      case 'MEETING':
        return 'groups';
      case 'ACCOUNT_UPDATE':
        return 'person';
      case 'SYSTEM':
        return 'notifications';
      default:
        return 'info';
    }
  }
}