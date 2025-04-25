// src/app/core/models/document.model.ts
export enum DocumentType {
  MEETING_REPORT = 'COMPTE_RENDU_REUNION',
  SEMINAR_REPORT = 'COMPTE_RENDU_SEMINAIRE',
  WEBINAR_REPORT = 'COMPTE_RENDU_WEBINAIRE',
  UNIVERSITY_COUNCIL = 'CONSEIL_UNIVERSITE',
  NOTE_SERVICE = 'NOTE_SERVICE',
  CIRCULAR = 'CIRCULAIRE',
  ADMINISTRATIVE_NOTE = 'NOTE_ADMINISTRATIVE',
  OTHER = 'AUTRE',
}

export enum VisibilityLevel {
  PUBLIC = 'PUBLIC',
  ADMINISTRATION = 'ADMINISTRATION',
  TEACHERS = 'ENSEIGNANTS',
  STUDENTS = 'ETUDIANTS',
  RESTRICTED = 'RESTREINT',
}

export interface Document {
  id: number;
  title: string;
  content: string;
  type: DocumentType;
  visibilityLevel: VisibilityLevel;
  filePath?: string;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: {
    id: number;
    username: string;
    fullName: string;
  };
  tags?: string[];
}
