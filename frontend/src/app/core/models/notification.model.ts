// src/app/core/models/notification.model.ts
import { User } from './user.model';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS'
}

export interface Notification {
  id?: number; // Optional id
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  recipient?: User; // Optional reference to the user who receives the notification
}