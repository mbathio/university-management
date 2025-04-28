// src/app/modules/communication/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getRecentNotifications(limit = 5): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/recent?limit=${limit}`)
      .pipe(catchError(this.handleError));
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread/count`)
      .pipe(catchError(this.handleError));
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {})
      .pipe(catchError(this.handleError));
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {})
      .pipe(catchError(this.handleError));
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification)
      .pipe(catchError(this.handleError));
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

  // Improved error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong; please try again later.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client side error:', error.error.message);
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`
      );
      
      if (error.status === 0) {
        errorMessage = 'Server is unreachable. Please check your connection.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (error.status === 401) {
        errorMessage = 'You need to log in to access this resource.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}