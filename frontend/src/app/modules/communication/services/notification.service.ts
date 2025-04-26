// src/app/modules/communication/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationType } from './models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  getRecentNotifications(limit: number = 5): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread/count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification);
  }

  // Helper method to get appropriate icon for notification type
  getNotificationIcon(type: string): string {
    switch (type) {
      case NotificationType.DOCUMENT_ADDED:
        return 'description';
      case NotificationType.ACCOUNT_UPDATE:
        return 'person';
      case NotificationType.SYSTEM:
        return 'info';
      case NotificationType.MEETING:
        return 'event';
      default:
        return 'notifications';
    }
  }
}