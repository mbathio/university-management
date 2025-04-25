// src/app/modules/communication/models/notification.model.ts
export enum NotificationType {
  DOCUMENT_ADDED = 'DOCUMENT_ADDED',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  SYSTEM = 'SYSTEM',
  MEETING = 'MEETING',
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  createdAt: Date;
  userId: number;
  referenceId?: number; // ID of related entity (document, meeting, etc.)
  referenceType?: string;
}
