// src/app/core/models/user.model.ts
import { VisibilityLevel, DocumentType } from './document.model';
import { Role } from './role.model';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
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