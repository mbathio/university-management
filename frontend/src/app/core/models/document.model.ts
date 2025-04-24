// src/app/core/models/document.model.ts
import { User } from './user.model';

export enum DocumentType {
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  REPORT = 'REPORT',
  CONTRACT = 'CONTRACT',
  MEMO = 'MEMO',
  GENERAL = 'GENERAL',
}

export enum VisibilityLevel {
  PUBLIC = 'PUBLIC',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

export interface Document {
  id: number;
  title: string;
  content?: string;
  type: DocumentType | string;
  visibilityLevel: VisibilityLevel | string;
  filePath?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: User;
}
