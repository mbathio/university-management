// src/app/core/models/user.model.ts
export enum Role {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    TUTOR = 'TUTOR',
    FORMATION_MANAGER = 'FORMATION_MANAGER',
    ADMINISTRATION = 'ADMINISTRATION',
    STUDENT = 'STUDENT'
  }
  
  export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    role: Role;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // src/app/core/models/student.model.ts
  export interface Student {
    id?: number;
    user?: User;
    studentId: string;
    firstName: string;
    lastName: string;
    birthDate?: Date;
    currentFormation?: Formation;
    promo?: string;
    startYear?: number;
    endYear?: number;
  }
  
  // src/app/core/models/staff.model.ts
  export interface Staff {
    id?: number;
    user?: User;
    staffId: string;
    firstName: string;
    lastName: string;
    position?: string;
    department?: string;
    contactInfo?: string;
  }
  
  // src/app/core/models/formation.model.ts
  export interface Formation {
    id?: number;
    name: string;
    type?: string;
    level?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    fundingAmount?: number;
    fundingType?: string;
  }
  
  // src/app/core/models/document.model.ts
  export enum DocumentType {
    REPORT = 'REPORT',
    MEMO = 'MEMO',
    CIRCULAR = 'CIRCULAR',
    INCOMING_MAIL = 'INCOMING_MAIL',
    OUTGOING_MAIL = 'OUTGOING_MAIL',
    ADMINISTRATIVE_NOTE = 'ADMINISTRATIVE_NOTE',
    SERVICE_NOTE = 'SERVICE_NOTE'
  }
  
  export interface Document {
    id?: number;
    title: string;
    type: DocumentType;
    content?: string;
    filePath?: string;
    createdBy?: User;
    createdAt?: Date;
    visibilityLevel?: string;
  }
  
  // src/app/core/models/auth.model.ts
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