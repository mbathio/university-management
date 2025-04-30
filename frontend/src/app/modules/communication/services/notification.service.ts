// src/app/modules/communication/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  constructor(private http: HttpClient) {}

  getNotifications(
    page = 0, 
    size = 10, 
    status: 'READ' | 'UNREAD' | 'ARCHIVED' | 'ALL' = 'ALL',
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  ): Observable<{ 
    content: Notification[], 
    totalElements: number, 
    totalPages: number 
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('status', status)
      .set('priority', priority || '');

    return this.http.get<{ 
      content: Notification[], 
      totalElements: number, 
      totalPages: number 
    }>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getRecentNotifications(limit = 5): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/recent?limit=${limit}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread/count`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateNotificationStatus(
    id: number, 
    status: 'READ' | 'UNREAD' | 'ARCHIVED'
  ): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Helper method to get appropriate icon for notification type
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.DOCUMENT_ADDED:
        return 'description';
      case NotificationType.ACCOUNT_UPDATE:
        return 'account_circle';
      case NotificationType.SYSTEM:
        return 'info';
      case NotificationType.MEETING:
        return 'event';
      default:
        return 'notifications';
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}