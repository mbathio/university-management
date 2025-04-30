// src/app/core/models/document.model.ts
import { User } from './user.model';

export enum DocumentType {
  REPORT = 'REPORT',
  CERTIFICATE = 'CERTIFICATE',
  SYLLABUS = 'SYLLABUS',
  MEETING_REPORT = 'COMPTE_RENDU_REUNION',
  SEMINAR_REPORT = 'COMPTE_RENDU_SEMINAIRE',
  WEBINAR_REPORT = 'COMPTE_RENDU_WEBINAIRE',
  UNIVERSITY_COUNCIL = 'CONSEIL_UNIVERSITE',
  NOTE_SERVICE = 'NOTE_SERVICE',
  CIRCULAR = 'CIRCULAIRE',
  ADMINISTRATIVE_NOTE = 'NOTE_ADMINISTRATIVE',
  OTHER = 'AUTRE'
}

export enum VisibilityLevel {
  PUBLIC = 'PUBLIC',
  ADMINISTRATION = 'ADMINISTRATION',
  TEACHERS = 'ENSEIGNANTS',
  STUDENTS = 'ETUDIANTS',
  RESTRICTED = 'RESTREINT',
}

export interface Document {
  id: number | undefined; 
  title: string;
  description: string;
  type: DocumentType;
  visibilityLevel: VisibilityLevel;
  fileName: string;
  filePath: string;
  createdAt: Date;
  updatedAt?: Date;
  
  content?: string;
  reference?: string;
  tags?: string[];
  createdBy?: {
    id?: number;
    username?: string;
    fullName?: string;
  };
  
  creator?: User; 
}

// Utility function for checking document creator
export function isDocumentCreatedBy(document: Document, user?: User): boolean {
  if (!document.createdBy?.id || !user) return false;
  return document.createdBy.id === user.id;
}