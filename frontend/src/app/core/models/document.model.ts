// src/app/core/models/document.model.ts
import { User } from './user.model';

export enum DocumentType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  ACADEMIC = 'ACADEMIC',
  REPORT = 'REPORT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  COURSE_MATERIAL = 'COURSE_MATERIAL',
  OTHER = 'OTHER',
  INVOICE = 'INVOICE'
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
  type: DocumentType;
  visibilityLevel: VisibilityLevel;
  filePath?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: User;
}
