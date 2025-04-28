// src/app/modules/communication/models/notification.model.ts
export enum NotificationType {
  DOCUMENT_ADDED = 'DOCUMENT_ADDED',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  SYSTEM = 'SYSTEM',
  MEETING = 'MEETING',
  OTHER = 'OTHER'
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  userId: number;
  relatedEntityId?: number;
  relatedEntityType?: string;
}