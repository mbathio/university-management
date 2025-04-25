// src/app/modules/communication/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  // Mock data for development without backend
  private mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Nouveau compte rendu',
      message:
        'Un nouveau compte rendu de réunion a été ajouté: "Réunion du conseil"',
      type: 'DOCUMENT_ADDED',
      read: false,
      createdAt: new Date('2025-04-22T15:30:00'),
      userId: 1,
      referenceId: 1,
      referenceType: 'DOCUMENT',
    },
    {
      id: 2,
      title: 'Rappel: Réunion pédagogique',
      message: 'La réunion pédagogique aura lieu demain à 14h00 en salle A201',
      type: 'MEETING',
      read: true,
      createdAt: new Date('2025-04-21T09:15:00'),
      userId: 1,
      referenceId: 3,
      referenceType: 'MEETING',
    },
    {
      id: 3,
      title: 'Nouvelle circulaire publiée',
      message: 'Une nouvelle circulaire concernant les examens a été publiée',
      type: 'DOCUMENT_ADDED',
      read: false,
      createdAt: new Date('2025-04-20T11:45:00'),
      userId: 1,
      referenceId: 2,
      referenceType: 'DOCUMENT',
    },
  ];

  constructor(private http: HttpClient) {}

  getUserNotifications(): Observable<Notification[]> {
    // For development without backend connection
    if (!environment.production) {
      return of(this.mockNotifications);
    }

    return this.http.get<Notification[]>(`${this.apiUrl}/user`);
  }

  getUnreadCount(): Observable<number> {
    // For development without backend connection
    if (!environment.production) {
      return of(this.mockNotifications.filter((n) => !n.read).length);
    }

    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    // For development without backend connection
    if (!environment.production) {
      const notification = this.mockNotifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
      return of(undefined);
    }

    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    // For development without backend connection
    if (!environment.production) {
      this.mockNotifications.forEach((n) => (n.read = true));
      return of(undefined);
    }

    return this.http.patch<void>(`${this.apiUrl}/mark-all-read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    // For development without backend connection
    if (!environment.production) {
      this.mockNotifications = this.mockNotifications.filter(
        (n) => n.id !== id,
      );
      return of(undefined);
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
