// src/app/modules/communication/models/notification.model.ts
export enum NotificationType {
  DOCUMENT_ADDED = 'DOCUMENT_ADDED',
  ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
  SYSTEM = 'SYSTEM',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
  REPORT_CREATED = 'REPORT_CREATED',
  ADMIN_NOTE = 'ADMIN_NOTE',
  CIRCULAR = 'CIRCULAR'
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  description?: string;
  type: NotificationType;
  status: 'READ' | 'UNREAD' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
  sender?: {
    id: number;
    fullName: string;
    username: string;
    avatar?: string;
  };
  recipient?: {
    id: number;
    fullName: string;
    username: string;
  };
  context?: {
    entityType?: string;
    entityId?: number;
    additionalInfo?: Record<string, any>;
  };
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  tags?: string[];
}