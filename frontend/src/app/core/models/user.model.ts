// src/app/core/models/user.model.ts
import { VisibilityLevel } from './document.model';

export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  FORMATION_MANAGER = 'FORMATION_MANAGER',
  ADMINISTRATION = 'ADMINISTRATION',
  STAFF = 'STAFF',
  TUTOR = 'TUTOR',
}

export enum DocumentType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  ACADEMIC = 'ACADEMIC',
  REPORT = 'REPORT',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  COURSE_MATERIAL = 'COURSE_MATERIAL',
  OTHER = 'OTHER',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Document {
  id: number;
  title: string;
  content?: string;
  type: DocumentType;
  createdAt: Date;
  visibilityLevel: VisibilityLevel;
  filePath?: string;
  createdBy?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
}

export interface Formation {
  id: number;
  name: string;
  type: string;
  level: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  fundingAmount?: number;
  fundingType?: string;
}

export interface Student {
  username: string;
  role: Role;
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  currentFormation?: Formation;
  promo?: string;
  startYear?: number;
  endYear?: number;
  user: User;
}

export interface Staff {
  id: number;
  staffId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  contactInfo?: string;
  user: User;
}

export interface StudentDto {
  username: string;
  password: string;
  email: string;
  studentId: string;
  firstName: string;
  lastName: string;
  birthDate?: Date;
  formationId?: number;
  promo: string;
  startYear: number;
  endYear: number;
}

export interface StaffDto {
  username: string;
  password: string;
  email: string;
  role: Role;
  staffId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  contactInfo: string;
}
