// src/app/core/models/user.model.ts
import { VisibilityLevel, DocumentType } from './document.model';
import { Role } from './role.model';

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  role: Role;
}

export interface Student extends User {
  studentId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  promo: string;
  startYear: number;
  endYear: number;
  user?: User;
  currentFormation?: any; // Optional current formation
  formationId?: number; // Optional formation ID
}

export interface Staff extends User {
  staffId: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  contactInfo: string;
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

export { Role } from './role.model';