// src/app/modules/insertion/services/insertion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Insertion {
  id: number;
  studentId: number;
  companyName: string;
  position: string;
  industry: string;
  startDate: Date;
  salaryRange?: string;
  contractType: string;
  location: string;
  feedback?: string;
  status: InsertionStatus;
}

export enum InsertionStatus {
  SEARCHING = 'SEARCHING',
  INTERVIEW_PROCESS = 'INTERVIEW_PROCESS',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  HIRED = 'HIRED',
  CONTINUING_STUDIES = 'CONTINUING_STUDIES',
  OTHER = 'OTHER'
}

@Injectable({
  providedIn: 'root'
})
export class InsertionService {
  private apiUrl = `${environment.apiUrl}/insertions`;

  constructor(private http: HttpClient) { }

  getAllInsertions(): Observable<Insertion[]> {
    return this.http.get<Insertion[]>(this.apiUrl);
  }

  getInsertionById(id: number): Observable<Insertion> {
    return this.http.get<Insertion>(`${this.apiUrl}/${id}`);
  }

  createInsertion(insertion: Insertion): Observable<Insertion> {
    return this.http.post<Insertion>(this.apiUrl, insertion);
  }

  updateInsertion(id: number, insertion: Insertion): Observable<Insertion> {
    return this.http.put<Insertion>(`${this.apiUrl}/${id}`, insertion);
  }

  deleteInsertion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getInsertionsByStudent(studentId: number): Observable<Insertion[]> {
    return this.http.get<Insertion[]>(`${this.apiUrl}/by-student/${studentId}`);
  }

  getInsertionsByFormation(formationId: number): Observable<Insertion[]> {
    return this.http.get<Insertion[]>(`${this.apiUrl}/by-formation/${formationId}`);
  }

  getInsertionsByYear(year: number): Observable<Insertion[]> {
    return this.http.get<Insertion[]>(`${this.apiUrl}/by-year/${year}`);
  }

  getInsertionStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getInsertionStatisticsByFormation(formationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/by-formation/${formationId}`);
  }

  getInsertionStatisticsByYear(year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics/by-year/${year}`);
  }
}