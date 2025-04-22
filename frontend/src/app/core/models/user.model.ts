// src/app/core/models/user.model.ts
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  FORMATION_MANAGER = 'FORMATION_MANAGER',
  ADMINISTRATION = 'ADMINISTRATION',
  TUTOR = 'TUTOR'
}

export enum DocumentType {
  REPORT = 'REPORT',
  MEETING_MINUTES = 'MEETING_MINUTES',
  CIRCULAR = 'CIRCULAR',
  ADMIN_NOTE = 'ADMIN_NOTE',
  SERVICE_NOTE = 'SERVICE_NOTE',
  INCOMING_MAIL = 'INCOMING_MAIL',
  OUTGOING_MAIL = 'OUTGOING_MAIL'
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Document {
  id: number;
  title: string;
  type: DocumentType;
  content?: string;
  fileUrl?: string;
  visibilityLevel: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Student {
  id: number;
  userId?: number;
  studentId: string; // INE
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  formationId?: number;
  formation?: Formation;
  promo?: string;
  startYear?: number;
  endYear?: number;
  diplomas?: string[];
  otherFormations?: string[];
  email?: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Formation {
  id: number;
  name: string;
  type?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  fundingAmount?: number;
  fundingType?: string;
  numberOfStudents?: number;
  numberOfFemaleStudents?: number;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}