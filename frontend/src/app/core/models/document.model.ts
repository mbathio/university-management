// src/app/core/models/document.model.ts
export enum DocumentType {
  ADMINISTRATIVE_NOTE = 'ADMINISTRATIVE_NOTE',
  CIRCULAR = 'CIRCULAR',
  NOTE_SERVICE = 'NOTE_SERVICE',
  REPORT = 'REPORT',
  OTHER = 'OTHER',
}

export enum VisibilityLevel {
  PUBLIC = 'PUBLIC',
  ADMINISTRATION = 'ADMINISTRATION',
  TEACHERS = 'TEACHERS',
  STUDENTS = 'STUDENTS',
  RESTRICTED = 'RESTRICTED',
}

export interface Document {
  id: number;
  title: string;
  content: string;
  type: DocumentType;
  visibilityLevel: VisibilityLevel;
  filePath?: string;
  reference?: string; // Added reference property
  createdAt: Date;
  createdBy: {
    id: number;
    username: string;
    fullName?: string;
  };
  updatedAt?: Date;
  updatedBy?: {
    id: number;
    username: string;
    fullName?: string;
  };
}
